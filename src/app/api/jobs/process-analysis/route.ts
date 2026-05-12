import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { anthropic } from "@/lib/anthropic"
import { calcularScores } from "@/lib/scoring"
import { SYSTEM_PROMPT_CACHEABLE, buildUserMessage } from "@/lib/ai/promptBuilder"
import { parseClaudeResponse } from "@/lib/ai/analysisParser"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import * as Sentry from "@sentry/nextjs"

export const maxDuration = 300

/**
 * Worker QStash: procesa un job de análisis IA.
 * QStash llama a este endpoint con un body { jobId, evaluacionId }.
 * El signing de QStash garantiza que solo QStash puede invocar.
 */
async function handler(req: NextRequest) {
  let job: { id: string; evaluacionId: string } | null = null

  try {
    const body = await req.json() as { jobId: string; evaluacionId: string }
    job = { id: body.jobId, evaluacionId: body.evaluacionId }

    // Marcar como processing
    await prisma.analysisJob.update({
      where: { id: body.jobId },
      data: { status: "processing", startedAt: new Date() },
    })

    // Cargar evaluación
    const ev = await prisma.evaluacion.findUnique({
      where: { id: body.evaluacionId },
      include: { estudiante: true },
    })
    if (!ev) throw new Error("Evaluación no encontrada")

    const scores = calcularScores(ev as any)
    const userMessage = buildUserMessage(ev.estudiante, ev, scores)

    // Stream con prompt caching
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT_CACHEABLE,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    })

    const message = await stream.finalMessage()
    const usage = (message as any).usage
    console.log("[process-analysis] usage:", JSON.stringify(usage))

    const rawText = message.content[0].type === "text" ? message.content[0].text : ""
    const analisis = parseClaudeResponse(rawText)

    // Guardar análisis y marcar job como done
    await prisma.evaluacion.update({
      where: { id: body.evaluacionId },
      data: {
        analisisIA: JSON.stringify(analisis),
        analisisGeneradoEn: new Date(),
        estadoAprendizaje: analisis.perfilDAE.nivelDificultad,
      },
    })

    await prisma.analysisJob.update({
      where: { id: body.jobId },
      data: { status: "done", completedAt: new Date() },
    })

    return NextResponse.json({ ok: true, jobId: body.jobId })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[process-analysis] Error:", msg)

    // Reportar a Sentry con contexto
    Sentry.captureException(err, {
      tags: { worker: "process-analysis", jobId: job?.id ?? "unknown" },
      extra: { evaluacionId: job?.evaluacionId },
    })

    if (job) {
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: { status: "failed", error: msg, completedAt: new Date() },
      }).catch(() => {})
    }

    // Devolver 200 para que QStash no reintente indefinidamente (a menos que sea error transitorio)
    return NextResponse.json({ ok: false, error: msg }, { status: 200 })
  }
}

// En desarrollo (sin signing keys) deshabilitamos verificación
const isDev = !process.env.QSTASH_CURRENT_SIGNING_KEY
export const POST = isDev ? handler : verifySignatureAppRouter(handler)
