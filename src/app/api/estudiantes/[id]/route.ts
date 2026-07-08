import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthContext, unauthorizedResponse, forbiddenResponse, canAccessResource, canViewInScope } from "@/lib/apiAuth"
import { estudianteUpdateSchema, validationError } from "@/lib/validators"
import { findOrCreateUE } from "@/lib/organizaciones"
import { ZodError } from "zod"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  const est = await prisma.estudiante.findUnique({
    where: { id: params.id },
    include: {
      evaluaciones: {
        orderBy: { fecha: "desc" },
        select: { id: true, fecha: true, evaluador: true, estadoAprendizaje: true, scoreCognitivo: true, scoreLexical: true },
      },
    },
  })
  if (!est) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (!(await canViewInScope(auth, est))) return forbiddenResponse()
  return NextResponse.json(est)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  const existing = await prisma.estudiante.findUnique({ where: { id: params.id }, select: { docenteId: true } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (!canAccessResource(auth, existing.docenteId)) return forbiddenResponse()

  try {
    const body = await req.json()
    const data = estudianteUpdateSchema.parse(body)
    const patch: any = { ...data }
    if (typeof data.fechaNac === "string") patch.fechaNac = new Date(data.fechaNac)
    // Si cambió el nombre de la U.E., re-resolver su FK (find-or-create normalizado).
    if (typeof data.unidadEducativa === "string" && data.unidadEducativa.trim()) {
      try { patch.unidadEducativaId = await findOrCreateUE(data.unidadEducativa) }
      catch (e) { console.error("[estudiantes/[id]/PUT] resolver U.E.:", e) }
    }
    const est = await prisma.estudiante.update({ where: { id: params.id }, data: patch })
    return NextResponse.json(est)
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(validationError(err), { status: 400 })
    }
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[estudiantes/[id]/PUT]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  const existing = await prisma.estudiante.findUnique({ where: { id: params.id }, select: { docenteId: true } })
  if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  if (!canAccessResource(auth, existing.docenteId)) return forbiddenResponse()

  try {
    // Borrar evaluaciones primero, luego el estudiante
    await prisma.evaluacion.deleteMany({ where: { estudianteId: params.id } })
    await prisma.estudiante.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[estudiantes/[id]/DELETE]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
