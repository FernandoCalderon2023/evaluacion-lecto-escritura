import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calcularScores } from "@/lib/scoring"
import { getAuthContext, unauthorizedResponse, forbiddenResponse, canAccessResource, resolveScope } from "@/lib/apiAuth"
import { evaluacionSchema, validationError, stripServerControlledEvalFields } from "@/lib/validators"
import { ZodError } from "zod"

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  const { searchParams } = new URL(req.url)
  const estudianteId = searchParams.get("estudianteId")

  // Scope jerárquico (docente / director / admin).
  const scope = await resolveScope(auth, "individual")
  const where: any = estudianteId ? { AND: [scope, { estudianteId }] } : scope

  const evaluaciones = await prisma.evaluacion.findMany({
    where,
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
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedResponse()

    const body = await req.json()
    // Solo exigimos estudianteId (para verificar propiedad). El resto de los campos los
    // gobierna el wizard; no reintroducimos validación estricta que rechace guardados
    // parciales que antes funcionaban (p. ej. "Evaluador" en blanco).
    const estudianteId = typeof body?.estudianteId === "string" ? body.estudianteId.trim() : ""
    if (!estudianteId) {
      return NextResponse.json({ error: "estudianteId requerido" }, { status: 400 })
    }

    // El estudiante debe pertenecer al docente (o ser admin).
    const estudiante = await prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { docenteId: true, unidadEducativaId: true },
    })
    if (!estudiante) return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 })
    if (!canAccessResource(auth, estudiante.docenteId)) return forbiddenResponse()

    // Quitar campos controlados por el servidor antes del spread.
    const clean = stripServerControlledEvalFields(body)
    const fecha = clean.fecha ? new Date(clean.fecha as string).toISOString() : new Date().toISOString()

    // Calcular scores del servidor
    const scores = calcularScores(clean)

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
        ...clean,
        fecha,
        docenteId: auth.userId,
        scoreCognitivo: scores.cognitivo.totalCorrect,
        scoreLexical: scores.lexical.totalCorrect,
        scoreComprension: scores.lectura.comprensionTotal,
        estadoAprendizaje: scores.estadoGeneral,
        // Hereda la U.E. del estudiante (para agregación por colegio).
        unidadEducativaId: estudiante.unidadEducativaId ?? null,
        ...bpmScores,
      },
    })
    return NextResponse.json(evaluacion, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(validationError(err), { status: 400 })
    }
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[evaluaciones/POST]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
