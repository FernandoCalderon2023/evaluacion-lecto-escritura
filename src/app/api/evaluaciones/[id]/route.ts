import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calcularScores } from "@/lib/scoring"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const ev = await prisma.evaluacion.findUnique({
    where: { id: params.id },
    include: { estudiante: true },
  })
  if (!ev) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(ev)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const fecha = body.fecha ? new Date(body.fecha).toISOString() : new Date().toISOString()
    const scores = calcularScores(body)

    const bpmScores = scores.bpm.applied ? {
      bpmScoreTonicidad: scores.bpm.tonicidad.score,
      bpmScoreEquilibrio: scores.bpm.equilibrio.score,
      bpmScoreLateralidad: scores.bpm.lateralidad.score,
      bpmScoreNocionCuerpo: scores.bpm.nocionCuerpo.score,
      bpmScoreEstructuracionET: scores.bpm.estructuracionET.score,
      bpmScorePraxiaGlobal: scores.bpm.praxiaGlobal.score,
      bpmScorePraxiaFina: scores.bpm.praxiaFina.score,
      bpmPerfilGeneral: scores.bpm.perfilGeneral,
    } : {}

    const ev = await prisma.evaluacion.update({
      where: { id: params.id },
      data: {
        ...body,
        fecha,
        scoreCognitivo: scores.cognitivo.totalCorrect,
        scoreLexical: scores.lexical.totalCorrect,
        scoreComprension: scores.lectura.comprensionTotal,
        estadoAprendizaje: scores.estadoGeneral,
        ...bpmScores,
        analisisIA: null,
        analisisGeneradoEn: null,
      },
    })
    return NextResponse.json(ev)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[evaluaciones/PUT]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.evaluacion.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
