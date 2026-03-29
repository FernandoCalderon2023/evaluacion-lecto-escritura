import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { anthropic } from "@/lib/anthropic"
import { calcularScores } from "@/lib/scoring"
import { buildAnalysisPrompt } from "@/lib/ai/promptBuilder"
import { parseClaudeResponse } from "@/lib/ai/analysisParser"

// Vercel Pro permite hasta 300s, Free hasta 60s
export const maxDuration = 300

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ev = await prisma.evaluacion.findUnique({
      where: { id: params.id },
      include: { estudiante: true },
    })
    if (!ev) return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })

    const scores = calcularScores(ev as any)
    const prompt = buildAnalysisPrompt(ev.estudiante, ev, scores)

    // Streaming para evitar timeout del SDK
    const stream = anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    })

    const message = await stream.finalMessage()

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : ""
    console.log("[analisis] stop_reason:", message.stop_reason, "length:", rawText.length)

    const analisis = parseClaudeResponse(rawText)

    await prisma.evaluacion.update({
      where: { id: params.id },
      data: {
        analisisIA: JSON.stringify(analisis),
        analisisGeneradoEn: new Date().toISOString(),
        estadoAprendizaje: analisis.perfilDAE.nivelDificultad,
      },
    })

    return NextResponse.json({ analisis })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[analisis/route] Error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
