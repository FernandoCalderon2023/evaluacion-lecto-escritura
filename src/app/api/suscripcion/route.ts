import { waitUntil } from "@vercel/functions"
import { queueNotice, sendNotice } from "@/lib/notifications"
import { NextRequest, NextResponse } from "next/server"
import { getAuthContext, unauthorizedResponse } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
const schema = z.object({ telefono: z.string().trim().min(6).max(40), organizacion: z.string().trim().max(150), mensaje: z.string().trim().max(1000), aceptaContacto: z.literal(true) }).strict()
export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()
  const parsed = schema.safeParse(await req.json().catch(()=>null))
  if (!parsed.success) return NextResponse.json({ error: "Indica tu teléfono y autoriza que te contactemos." }, { status: 400 })
  const { aceptaContacto, ...data } = parsed.data
  void aceptaContacto
  const result = await prisma.$transaction(async tx => {
    const updated = await tx.accesoComercial.updateMany({ where: { usuarioId: auth.userId, estado: "PRUEBA", solicitadoEn: null }, data: { ...data, solicitadoEn: new Date() } })
    if (updated.count) {
      const user = await tx.usuario.findUniqueOrThrow({ where: { id: auth.userId }, select: { nombre: true, email: true } })
      await queueNotice(tx, `solicitud-${auth.userId}`, "Solicitud de suscripción", [`Nombre: ${user.nombre}`, `Correo: ${user.email}`, `Teléfono: ${data.telefono}`, `Institución: ${data.organizacion}`, "El mensaje de la solicitud está disponible en administración."])
    }
    return updated
  })
  if (result.count) waitUntil(sendNotice(`solicitud-${auth.userId}`))
  return NextResponse.json({ ok: true, alreadyRequested: result.count === 0 })
}
