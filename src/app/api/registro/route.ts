import { waitUntil } from "@vercel/functions"
import { queueNotice, sendNotice } from "@/lib/notifications"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { createHmac } from "node:crypto"
import { getClientIp } from "@/lib/ratelimit"

const schema = z.object({ nombre: z.string().trim().min(2).max(100), email: z.string().trim().toLowerCase().email().max(254), password: z.string().min(10).max(72).refine(v => Buffer.byteLength(v, "utf8") <= 72), perfil: z.enum(["DOCENTE", "FAMILIA"]).default("DOCENTE"), aceptaTerminos: z.literal(true) }).strict()
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos. Usa una contraseña de 10 a 72 caracteres y acepta los términos." }, { status: 400 })
  try {
    const key = createHmac("sha256", process.env.NEXTAUTH_SECRET!).update(`${getClientIp(req)}:${Math.floor(Date.now()/3600000)}`).digest("hex")
    const window = await prisma.registroVentana.upsert({ where: { id: key }, create: { id: key }, update: { intentos: { increment: 1 } } })
    if (window.intentos > 5) return NextResponse.json({ error: "Se alcanzó el límite de registros. Intenta más tarde." }, { status: 429, headers: { "Retry-After": "3600" } })
    const { nombre, email, password, perfil } = parsed.data
    if (await prisma.usuario.findUnique({ where: { email }, select: { id: true } })) return NextResponse.json({ error: "No se puede registrar este correo. Si ya tienes cuenta, inicia sesión." }, { status: 409 })
    const passwordHash = await bcrypt.hash(password,12)
    const noticeId = await prisma.$transaction(async tx => {
      const user = await tx.usuario.create({ data: { nombre, email, passwordHash, rol: perfil, accesoComercial: { create: {} } } })
      const id = `registro-${user.id}`
      await queueNotice(tx, id, "Nueva cuenta de prueba", [`Nombre: ${nombre}`, `Correo: ${email}`, `Perfil: ${perfil}`, "Se registró una cuenta con acceso limitado."])
      return id
    })
    waitUntil(sendNotice(noticeId))
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") return NextResponse.json({ error: "Este correo ya está registrado." }, { status: 409 })
    return NextResponse.json({ error: "No se pudo crear la cuenta. Intenta nuevamente." }, { status: 503 })
  }
}
