import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { anthropic } from "@/lib/anthropic"
import { calcularScores } from "@/lib/scoring"
import { SYSTEM_PROMPT_CACHEABLE, buildUserMessage } from "@/lib/ai/promptBuilder"
import { parseClaudeResponse } from "@/lib/ai/analysisParser"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Vercel Pro: hasta 300s
export const maxDuration = 300

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    const isAdmin = (session.user as any).role === "ADMIN"
    const docenteId = (session.user as any).id

    const ev = await prisma.evaluacion.findUnique({
      where: { id: params.id },
      include: { estudiante: true },
    })
    if (!ev) return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
    if (!isAdmin && ev.docenteId !== docenteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const scores = calcularScores(ev as any)
    const userMessage = buildUserMessage(ev.estudiante, ev, scores)

    // Streaming + prompt caching:
    // - El system prompt cacheable se reutiliza entre evaluaciones (90% descuento en hits)
    // - El user message es dinámico (datos del estudiante actual)
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
    console.log("[analisis] stop_reason:", message.stop_reason, "usage:", JSON.stringify(usage))

    const rawText = message.content[0].type === "text" ? message.content[0].text : ""
    const analisis = parseClaudeResponse(rawText)

    await prisma.evaluacion.update({
      where: { id: params.id },
      data: {
        analisisIA: JSON.stringify(analisis),
        analisisGeneradoEn: new Date().toISOString(),
        estadoAprendizaje: analisis.perfilDAE.nivelDificultad,
      },
    })

    return NextResponse.json({
      analisis,
      cache: usage ? {
        cache_creation_input_tokens: usage.cache_creation_input_tokens,
        cache_read_input_tokens: usage.cache_read_input_tokens,
      } : null,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[analisis/route] Error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
