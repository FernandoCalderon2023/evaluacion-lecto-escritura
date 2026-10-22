import { reportFingerprint } from "@/lib/reportFingerprint"
import { REPORT_RULES_VERSION } from "@/lib/reportEvidence"
import { prisma } from "@/lib/prisma"
import { anthropic } from "@/lib/anthropic"
import { calcularScores } from "@/lib/scoring"
import { guardReport, readGuardedReport, RECOMMENDATION_PROMPT, recommendationContext } from "@/lib/ai/reportGuard"
import { ANALYSIS_TOOL } from "@/lib/ai/analysisSchema"
import { deepseekEnabled, generarInformeDeepseek } from "@/lib/ai/deepseek"
import * as Sentry from "@sentry/nextjs"
import { getAIControl, claimAnalysisJob, consumeAnalysisQuota, AnalysisBusyError, AnalysisAlreadyRunning, AnalysisError, publicAnalysisError } from "./capacity"
import type { AnalisisIA } from "@/types/ai"

// Shared generator for inline requests and signed queue deliveries.
export async function procesarAnalisis(jobId: string, evaluacionId: string): Promise<AnalisisIA> {
  // Claim once. Duplicate queue delivery must not regenerate or fail another worker's job.
  const claimed = await claimAnalysisJob(jobId, evaluacionId)
  if (!claimed) {
    const job = await prisma.analysisJob.findFirst({ where: { id: jobId, evaluacionId } })
    if (job?.status === "queued") throw new AnalysisBusyError((await getAIControl()).paused)
    if (job?.status === "processing") throw new AnalysisAlreadyRunning()
    const ev = job?.status === "done" ? await prisma.evaluacion.findUnique({ where: { id: evaluacionId } }) : null
    const existing = ev ? readGuardedReport(ev.analisisIA, calcularScores(ev as any)) : null
    if (existing) return existing
    throw new AnalysisError("AI_JOB_UNAVAILABLE", "Este trabajo ya no está disponible. Solicita un nuevo informe.", 409)
  }
  try {
    const ev = await prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: { estudiante: true },
    })
    if (!ev) throw new Error("Evaluación no encontrada")

    const job = await prisma.analysisJob.findUniqueOrThrow({ where: { id: jobId } })
    await consumeAnalysisQuota(job.docenteId ?? ev.docenteId ?? "legacy")
    const scores = calcularScores(ev as any)
    const userMessage = recommendationContext(scores)

    let analisis: AnalisisIA

    if (deepseekEnabled()) {
      // Proveedor DeepSeek (activo si DEEPSEEK_API_KEY está en el entorno)
      analisis = await generarInformeDeepseek(RECOMMENDATION_PROMPT, userMessage)
      console.log("[procesarAnalisis] proveedor: DeepSeek")
    } else {
      // Proveedor Anthropic: tool_use con prompt caching
      const stream = anthropic.messages.stream({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: [
          {
            type: "text",
            text: RECOMMENDATION_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: [ANALYSIS_TOOL],
        tool_choice: { type: "tool", name: ANALYSIS_TOOL.name },
        messages: [{ role: "user", content: userMessage }],
      })

      const message = await stream.finalMessage()
      console.log("[procesarAnalisis] proveedor: Anthropic, stop_reason:", message.stop_reason)

      const toolUseBlock = message.content.find(
        (block) => block.type === "tool_use"
      ) as { type: "tool_use"; name: string; input: AnalisisIA } | undefined

      if (!toolUseBlock) {
        throw new Error(
          "El proveedor no devolvió sugerencias estructuradas. Intente nuevamente."
        )
      }
      analisis = toolUseBlock.input
    }

    analisis = guardReport(analisis, scores)

    await prisma.$transaction(async tx => {
      // Fence expired/cancelled workers before saving. Report and completion commit together.
      const completed = await tx.analysisJob.updateMany({ where: { id: jobId, status: "processing", activeKey: evaluacionId }, data: { status: "done", activeKey: null, completedAt: new Date() } })
      if (completed.count !== 1) throw new AnalysisError("AI_JOB_EXPIRED", "El trabajo venció. Solicita un nuevo informe.", 409)
      const persisted = await tx.evaluacion.updateMany({
        where: { id: evaluacionId, updatedAt: ev.updatedAt },
        data: { analisisIA: JSON.stringify(analisis), analisisGeneradoEn: new Date(), estadoAprendizaje: scores.estadoGeneral },
      })
      if (persisted.count !== 1) throw new AnalysisError("AI_EVALUATION_CHANGED", "La evaluación cambió durante el análisis. Genera un nuevo informe con los datos actualizados.", 409)
      await tx.auditLog.create({ data: { actorId: job.docenteId, action: "evaluation_ai_generated", target: evaluacionId, metadata: JSON.stringify({ jobId, rules: REPORT_RULES_VERSION, fingerprint: reportFingerprint(ev), provider: process.env.DEEPSEEK_API_KEY ? "DeepSeek" : "Anthropic", reviewed: false }) } })
    })

    return analisis
  } catch (err: unknown) {
    const msg = publicAnalysisError(err).message
    console.error("[procesarAnalisis] Error:", msg)

    Sentry.captureException(err, {
      tags: { worker: "procesarAnalisis", jobId },
      extra: { evaluacionId },
    })

    await prisma.analysisJob
      .updateMany({
        where: { id: jobId, status: "processing" },
        data: { status: "failed", activeKey: null, error: msg, completedAt: new Date() },
      })
      .catch(() => {})

    throw err
  }
}
