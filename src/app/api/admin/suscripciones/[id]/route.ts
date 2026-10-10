import { waitUntil } from "@vercel/functions"
import { queueNotice, sendNotice } from "@/lib/notifications"
import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { logAudit, getRequestContext } from "@/lib/audit"
export async function POST(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const result = await prisma.$transaction(async tx => {
    const updated = await tx.accesoComercial.updateMany({ where: { usuarioId: params.id, estado: "PRUEBA", solicitadoEn: { not: null } }, data: { estado: "ACTIVO", activadoEn: new Date() } })
    if(updated.count) {
      const user = await tx.usuario.findUniqueOrThrow({ where: { id: params.id }, select: { nombre: true, email: true } })
      await queueNotice(tx, `activacion-${params.id}`, "Acceso completo habilitado", [`Nombre: ${user.nombre}`, `Correo: ${user.email}`, `Activado por: ${gate.auth.email}`, "Este aviso confirma la habilitación de acceso, no un pago."])
    }
    return updated
  })
  if(result.count) waitUntil(sendNotice(`activacion-${params.id}`))
  if (!result.count) return NextResponse.json({ error: "No hay una solicitud pendiente para esta cuenta." }, { status: 409 })
  logAudit({ actorId: gate.auth.userId, actorEmail: gate.auth.email, action: "activate_subscription", target: params.id, ...getRequestContext(_) })
  return NextResponse.json({ ok: true })
}
