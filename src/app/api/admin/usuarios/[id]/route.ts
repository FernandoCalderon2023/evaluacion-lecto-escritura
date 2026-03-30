import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

  return NextResponse.json({ id: usuario.id, activo: usuario.activo })
}
