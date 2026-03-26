import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calcularScores } from "@/lib/scoring"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const estudianteId = searchParams.get("estudianteId")

  const evaluaciones = await prisma.evaluacion.findMany({
    where: estudianteId ? { estudianteId } : undefined,
    orderBy: { fecha: "desc" },
    include: {
      estudiante: {
        select: { nombre: true, apellido1: true, apellido2: true, grado: true },
      },
    },
  })
  return NextResponse.json(evaluaciones)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Convertir fecha a ISO-8601 completo que Prisma acepta
  const fecha = body.fecha ? new Date(body.fecha).toISOString() : new Date().toISOString()

  // Calcular scores del servidor
  const scores = calcularScores(body)

  // Preparar datos BPM calculados
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

  const evaluacion = await prisma.evaluacion.create({
    data: {
      ...body,
      fecha,
      scoreCognitivo: scores.cognitivo.totalCorrect,
      scoreLexical: scores.lexical.totalCorrect,
      scoreComprension: scores.lectura.comprensionTotal,
      estadoAprendizaje: scores.estadoGeneral,
      ...bpmScores,
    },
  })
  return NextResponse.json(evaluacion, { status: 201 })
}
