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
  const body = await req.json()
  const scores = calcularScores(body)

  const ev = await prisma.evaluacion.update({
    where: { id: params.id },
    data: {
      ...body,
      scoreCognitivo: scores.cognitivo.totalCorrect,
      scoreLexical: scores.lexical.totalCorrect,
      scoreComprension: scores.lectura.comprensionTotal,
      estadoAprendizaje: scores.estadoGeneral,
      // Limpiar análisis anterior si se edita
      analisisIA: null,
      analisisGeneradoEn: null,
    },
  })
  return NextResponse.json(ev)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.evaluacion.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
