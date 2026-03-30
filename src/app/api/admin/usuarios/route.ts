import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { nombre, email, password, rol } = await req.json()
  if (!nombre || !email || !password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  const exists = await prisma.usuario.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (exists) {
    return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email: email.toLowerCase().trim(),
      passwordHash,
      rol: rol === "ADMIN" ? "ADMIN" : "DOCENTE",
    },
  })

  return NextResponse.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email }, { status: 201 })
}
