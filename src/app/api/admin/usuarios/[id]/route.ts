import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit, getRequestContext } from "@/lib/audit"
import { z } from "zod"

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const parsed = z.object({ activo: z.boolean() }).strict().safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Indica un estado de cuenta válido" }, { status: 400 })
  const body = parsed.data
  if (params.id === (session!.user as any).id && !body.activo) {
    return NextResponse.json({ error: "No puedes desactivar tu propia cuenta" }, { status: 400 })
  }
  const existing = await prisma.usuario.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!existing) return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 })
  const usuario = await prisma.usuario.update({
    where: { id: params.id },
    data: { activo: body.activo, ...(!body.activo ? { sessionVersion: { increment: 1 } } : {}) },
  })

  const ctx = getRequestContext(req)
  logAudit({
    actorId: (session!.user as any).id,
    actorEmail: session!.user?.email ?? null,
    action: body.activo ? "activate_user" : "deactivate_user",
    target: usuario.id,
    metadata: { email: usuario.email, activo: usuario.activo },
    ...ctx,
  })

  return NextResponse.json({ id: usuario.id, activo: usuario.activo })
}
