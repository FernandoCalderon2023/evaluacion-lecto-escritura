import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getAuthContext, unauthorizedResponse, forbiddenResponse } from "@/lib/apiAuth"
import { institutionFor, institutionalUserSchema, createInstitutionUser, InstitutionLimitError } from "@/lib/institution"

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()
  const member = await institutionFor(auth.userId)
  if (!member?.gestor) return forbiddenResponse()
  const parsed = institutionalUserSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Indica nombre, correo válido y una contraseña de 12 a 72 caracteres." }, { status: 400 })
  const { password, ...data } = parsed.data
  const passwordHash = await bcrypt.hash(password, 12)
  try {
    const user = await prisma.$transaction(async tx => {
      const result = await createInstitutionUser(tx, member.institucionId, { ...data, passwordHash })
      await tx.auditLog.create({ data: { actorId: auth.userId, action: "institution_create_user", target: result.id, metadata: JSON.stringify({ institucionId: member.institucionId }) } })
      return result
    })
    return NextResponse.json(user, { status: 201 })
  } catch (err: any) {
    if (err instanceof InstitutionLimitError) return NextResponse.json({ error: err.message }, { status: 409 })
    if (err.code === "P2002") return NextResponse.json({ error: "No se puede crear una cuenta con ese correo. No se trasladan cuentas existentes automáticamente." }, { status: 409 })
    console.error("institution/create", err.code)
    return NextResponse.json({ error: "No se pudo crear la cuenta. Intenta nuevamente." }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()
  const member = await institutionFor(auth.userId)
  if (!member?.gestor) return forbiddenResponse()
  const parsed = z.object({ usuarioId: z.string().min(1), activo: z.boolean() }).strict().safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 })
  const { usuarioId, activo } = parsed.data
  if (usuarioId === auth.userId) return NextResponse.json({ error: "No puedes desactivar tu propia cuenta." }, { status: 400 })
  const target = await prisma.institucionMiembro.findFirst({ where: { usuarioId, institucionId: member.institucionId, gestor: false } })
  if (!target) return forbiddenResponse()
  await prisma.$transaction(async tx => {
    await tx.usuario.update({ where: { id: usuarioId }, data: { activo, ...(!activo ? { sessionVersion: { increment: 1 } } : {}) } })
    await tx.auditLog.create({ data: { actorId: auth.userId, action: activo ? "institution_activate_user" : "institution_deactivate_user", target: usuarioId, metadata: JSON.stringify({ institucionId: member.institucionId }) } })
  })
  return NextResponse.json({ ok: true })
}
