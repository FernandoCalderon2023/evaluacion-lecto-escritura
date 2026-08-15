import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { anthropic } from "@/lib/anthropic"
import { calcularScores } from "@/lib/scoring"
import { SYSTEM_PROMPT_CACHEABLE, buildUserMessage } from "@/lib/ai/promptBuilder"
import { ANALYSIS_TOOL } from "@/lib/ai/analysisSchema"
import { deepseekEnabled, generarInformeDeepseek } from "@/lib/ai/deepseek"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import * as Sentry from "@sentry/nextjs"
import type { AnalisisIA } from "@/types/ai"

export const maxDuration = 300

/**
 * Worker QStash: procesa un job de análisis IA usando tool_use.
 *
 * Ventajas de tool_use vs prompt JSON:
 *  - JSON garantizado por Anthropic (cero errores de parseo)
 *  - Más rápido (Claude no genera preamble ni "```json")
 *  - Schema enforcement (campos requeridos, enums)
 */
async function handler(req: NextRequest) {
  let job: { id: string; evaluacionId: string } | null = null

  try {
    const body = (await req.json()) as { jobId: string; evaluacionId: string }
    job = { id: body.jobId, evaluacionId: body.evaluacionId }

    await prisma.analysisJob.update({
      where: { id: body.jobId },
      data: { status: "processing", startedAt: new Date() },
    })

    const ev = await prisma.evaluacion.findUnique({
      where: { id: body.evaluacionId },
      include: { estudiante: true },
    })
    if (!ev) throw new Error("Evaluación no encontrada")

    const scores = calcularScores(ev as any)
    const userMessage = buildUserMessage(ev.estudiante, ev, scores)

    let analisis: AnalisisIA

    if (deepseekEnabled()) {
      // Proveedor DeepSeek (activo si DEEPSEEK_API_KEY está en el entorno de Vercel)
      analisis = await generarInformeDeepseek(SYSTEM_PROMPT_CACHEABLE, userMessage)
      console.log("[process-analysis] proveedor: DeepSeek")
    } else {
      // Proveedor Anthropic (por defecto): tool_use con prompt caching
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
      console.log("[process-analysis] proveedor: Anthropic, stop_reason:", message.stop_reason)

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

    Sentry.captureException(err, {
      tags: { worker: "process-analysis", jobId: job?.id ?? "unknown" },
      extra: { evaluacionId: job?.evaluacionId },
    })

    if (job) {
      await prisma.analysisJob
        .update({
          where: { id: job.id },
          data: { status: "failed", error: msg, completedAt: new Date() },
        })
        .catch(() => {})
    }

    return NextResponse.json({ ok: false, error: msg }, { status: 200 })
  }
}

// Verificación de firma QStash.
//  - Con signing key: verificación OBLIGATORIA (verifySignatureAppRouter).
//  - Sin signing key en producción: fail-closed (503) para no dejar el worker abierto.
//  - Sin signing key en desarrollo: se permite (para pruebas locales sin QStash).
const hasSigningKey = !!process.env.QSTASH_CURRENT_SIGNING_KEY
const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"

async function rejectUnconfigured() {
  return NextResponse.json(
    { error: "Worker no configurado: falta QSTASH_CURRENT_SIGNING_KEY" },
    { status: 503 },
  )
}

export const POST = hasSigningKey
  ? verifySignatureAppRouter(handler)
  : isProd
    ? rejectUnconfigured
    : handler
