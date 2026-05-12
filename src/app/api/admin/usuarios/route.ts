import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { usuarioCreateSchema, validationError } from "@/lib/validators"
import { ZodError } from "zod"
import { adminRateLimit, checkRateLimit } from "@/lib/ratelimit"
import { logAudit, getRequestContext } from "@/lib/audit"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  // Rate limit: 50 acciones admin por hora
  const adminId = (session!.user as any).id
  const rl = await checkRateLimit(adminRateLimit, `admin:${adminId}`)
  if (!rl.allowed) {
    return NextResponse.json({
      error: `Demasiadas acciones. Intenta en ${Math.ceil(rl.retryAfterSeconds / 60)} minutos.`,
    }, { status: 429 })
  }

  try {
    const raw = await req.json()
    const data = usuarioCreateSchema.parse(raw)

    const exists = await prisma.usuario.findUnique({ where: { email: data.email } })
    if (exists) {
      return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(data.password, 10)
    const usuario = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        passwordHash,
        rol: data.rol,
      },
    })

    // Audit log
    const ctx = getRequestContext(req)
    logAudit({
      actorId: adminId,
      actorEmail: session!.user?.email ?? null,
      action: "create_user",
      target: usuario.id,
      metadata: { email: usuario.email, rol: usuario.rol },
      ...ctx,
    })

    return NextResponse.json({ id: usuario.id, nombre: usuario.nombre, email: usuario.email }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(validationError(err), { status: 400 })
    }
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[admin/usuarios/POST]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
