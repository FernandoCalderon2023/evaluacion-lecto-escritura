import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { anthropic } from "@/lib/anthropic"
import { calcularScores } from "@/lib/scoring"
import { buildAnalysisPrompt } from "@/lib/ai/promptBuilder"
import { parseClaudeResponse } from "@/lib/ai/analysisParser"

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ev = await prisma.evaluacion.findUnique({
      where: { id: params.id },
      include: { estudiante: true },
    })
    if (!ev) return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scores = calcularScores(ev as any)
    const prompt = buildAnalysisPrompt(ev.estudiante, ev, scores)

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 32000,
      messages: [{ role: "user", content: prompt }],
    })

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : ""
    if (message.stop_reason === "max_tokens") {
      console.warn("[analisis] Respuesta truncada, intentando parsear parcialmente...")
    }
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
