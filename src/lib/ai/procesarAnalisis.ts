import { prisma } from "@/lib/prisma"
import { anthropic } from "@/lib/anthropic"
import { calcularScores } from "@/lib/scoring"
import { SYSTEM_PROMPT_CACHEABLE, buildUserMessage } from "@/lib/ai/promptBuilder"
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
  try {
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: "processing", startedAt: new Date() },
    })

    const ev = await prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: { estudiante: true },
    })
    if (!ev) throw new Error("Evaluación no encontrada")

    const scores = calcularScores(ev as any)
    const userMessage = buildUserMessage(ev.estudiante, ev, scores)

    let analisis: AnalisisIA

    if (deepseekEnabled()) {
      // Proveedor DeepSeek (activo si DEEPSEEK_API_KEY está en el entorno)
      analisis = await generarInformeDeepseek(SYSTEM_PROMPT_CACHEABLE, userMessage)
      console.log("[procesarAnalisis] proveedor: DeepSeek")
    } else {
      // Proveedor Anthropic: tool_use con prompt caching
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
        const textBlock = message.content.find((b) => b.type === "text")
        const textContent = textBlock?.type === "text" ? textBlock.text : ""
        throw new Error(
          `Claude no devolvió tool_use. Stop reason: ${message.stop_reason}. Content: ${textContent.slice(0, 200)}`
        )
      }
      analisis = toolUseBlock.input
    }

    // Validación mínima
    if (!analisis.perfilDAE?.nivelDificultad) {
      throw new Error("Tool output sin perfilDAE.nivelDificultad")
    }

    await prisma.evaluacion.update({
      where: { id: evaluacionId },
      data: {
        analisisIA: JSON.stringify(analisis),
        analisisGeneradoEn: new Date(),
        estadoAprendizaje: analisis.perfilDAE.nivelDificultad,
      },
    })

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: "done", completedAt: new Date() },
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
        data: { status: "failed", error: msg, completedAt: new Date() },
      })
      .catch(() => {})

    throw err
  }
}
