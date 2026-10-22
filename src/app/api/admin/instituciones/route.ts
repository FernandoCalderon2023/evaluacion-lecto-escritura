import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/apiAuth"
import { institutionalUserSchema, createInstitutionUser } from "@/lib/institution"
import { z } from "zod"

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const parsed = z.object({ institucion: z.string().trim().min(2).max(160), responsable: institutionalUserSchema }).strict().safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Indica institución, responsable, correo válido y contraseña de 12 a 72 caracteres." }, { status: 400 })
  const { password, ...data } = parsed.data.responsable
  const passwordHash = await bcrypt.hash(password, 12)
  try {
    const plan = await prisma.$transaction(async tx => {
      const plan = await tx.institucionPlan.create({ data: { nombre: parsed.data.institucion, limiteUsuarios: 10, limiteEvaluaciones: 15 } })
      const user = await createInstitutionUser(tx, plan.id, { ...data, passwordHash }, true)
      await tx.auditLog.create({ data: { actorId: gate.auth.userId, action: "institution_provision", target: plan.id, metadata: JSON.stringify({ responsableId: user.id, usuarios: 10, evaluaciones: 15 }) } })
      return { id: plan.id, nombre: plan.nombre }
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Ese correo ya tiene cuenta. No se cambia su pertenencia automáticamente." }, { status: 409 })
    console.error("institution/provision", err.code)
    return NextResponse.json({ error: "No se pudo preparar la institución. Intenta nuevamente." }, { status: 500 })
  }
}
