import { prisma } from "@/lib/prisma"
import { anthropic } from "@/lib/anthropic"
import { calcularScores } from "@/lib/scoring"
import { guardReport, readGuardedReport, RECOMMENDATION_PROMPT, recommendationContext } from "@/lib/ai/reportGuard"
import { ANALYSIS_TOOL } from "@/lib/ai/analysisSchema"
import { deepseekEnabled, generarInformeDeepseek } from "@/lib/ai/deepseek"
import * as Sentry from "@sentry/nextjs"
import type { AnalisisIA } from "@/types/ai"

/**
 * Genera el informe psicopedagógico con IA para una evaluación y lo persiste.
 * Marca el job como processing → done (o failed, con el motivo).
 *
 * Es la ÚNICA implementación de la generación: la usan
 *  - el worker de QStash (/api/jobs/process-analysis), camino normal, y
 *  - el endpoint de encolar, como RESPALDO inline cuando la cola no está
 *    disponible (p. ej. cuota diaria de QStash agotada).
 *
 * Devuelve el análisis. Si falla, deja el job en "failed" y relanza el error.
 */
export async function procesarAnalisis(jobId: string, evaluacionId: string): Promise<AnalisisIA> {
  // Claim once. Duplicate queue delivery must not regenerate or fail another worker's job.
  const claimed = await prisma.analysisJob.updateMany({ where: { id: jobId, evaluacionId, status: "queued" }, data: { status: "processing", startedAt: new Date() } })
  if (!claimed.count) {
    const job = await prisma.analysisJob.findFirst({ where: { id: jobId, evaluacionId, status: "done" } })
    const ev = job ? await prisma.evaluacion.findUnique({ where: { id: evaluacionId } }) : null
    const existing = ev ? readGuardedReport(ev.analisisIA, calcularScores(ev as any)) : null
    if (existing) return existing
    throw new Error("El trabajo ya está siendo procesado o no está disponible.")
  }
  try {
    const ev = await prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: { estudiante: true },
    })
    if (!ev) throw new Error("Evaluación no encontrada")

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

    const persisted = await prisma.evaluacion.updateMany({
      where: { id: evaluacionId, updatedAt: ev.updatedAt },
      data: {
        analisisIA: JSON.stringify(analisis),
        analisisGeneradoEn: new Date(),
        // La IA interpreta; la clasificación sigue siendo la del instrumento.
        estadoAprendizaje: scores.estadoGeneral,
      },
    })

    if (persisted.count !== 1) throw new Error("La evaluación cambió durante el análisis. Genere un nuevo informe con los datos actualizados.")

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: "done", activeKey: null, completedAt: new Date() },
    })

    return analisis
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[procesarAnalisis] Error:", msg)

    Sentry.captureException(err, {
      tags: { worker: "procesarAnalisis", jobId },
      extra: { evaluacionId },
    })

    await prisma.analysisJob
      .update({
        where: { id: jobId },
        data: { status: "failed", activeKey: null, error: msg, completedAt: new Date() },
      })
      .catch(() => {})

    throw err
  }
}
