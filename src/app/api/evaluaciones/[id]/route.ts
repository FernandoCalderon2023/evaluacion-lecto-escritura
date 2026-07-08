import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calcularScores } from "@/lib/scoring"
import { getAuthContext, unauthorizedResponse, forbiddenResponse, canAccessResource, canViewInScope } from "@/lib/apiAuth"
import { stripServerControlledEvalFields } from "@/lib/validators"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  const ev = await prisma.evaluacion.findUnique({
    where: { id: params.id },
    include: { estudiante: true },
  })
  if (!ev) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  // Autorizar por la U.E. ACTUAL del estudiante (no la copia denormalizada de la evaluación),
  // para no dejar acceso a un director de la U.E. anterior tras un traslado del menor.
  if (!(await canViewInScope(auth, { docenteId: ev.docenteId, unidadEducativaId: ev.estudiante?.unidadEducativaId ?? null }))) {
    return forbiddenResponse()
  }
  return NextResponse.json(ev)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  const existing = await prisma.evaluacion.findUnique({ where: { id: params.id }, select: { docenteId: true } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (!canAccessResource(auth, existing.docenteId)) return forbiddenResponse()

  try {
    const body = await req.json()
    const clean = stripServerControlledEvalFields(body)
    // El estudiante de una evaluación es inmutable: nunca se reasigna en una edición.
    // (Evita IDOR: reapuntar la evaluación al estudiante de otro docente y filtrar su PII.)
    delete (clean as any).estudianteId
    const fecha = clean.fecha ? new Date(clean.fecha as string).toISOString() : new Date().toISOString()
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

    const ev = await prisma.evaluacion.update({
      where: { id: params.id },
      data: {
        ...clean,
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
    console.error("[evaluaciones/[id]/PUT]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  const existing = await prisma.evaluacion.findUnique({ where: { id: params.id }, select: { docenteId: true } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (!canAccessResource(auth, existing.docenteId)) return forbiddenResponse()

  try {
    await prisma.evaluacion.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[evaluaciones/[id]/DELETE]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
