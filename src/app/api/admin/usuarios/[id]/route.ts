import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit, getRequestContext } from "@/lib/audit"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await req.json()
  const usuario = await prisma.usuario.update({
    where: { id: params.id },
    data: { activo: body.activo },
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
