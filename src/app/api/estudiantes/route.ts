import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAuthContext, unauthorizedResponse, ownerScope } from "@/lib/apiAuth"
import { estudianteSchema, validationError } from "@/lib/validators"
import { ZodError } from "zod"

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""

  // Aislamiento por docente: un docente solo ve sus estudiantes; admin ve todos.
  const where: any = { ...ownerScope(auth) }
  if (q) {
    where.OR = [
      { codigo: { contains: q } },
      { nombre: { contains: q } },
      { apellido1: { contains: q } },
      { apellido2: { contains: q } },
    ]
  }

  const estudiantes = await prisma.estudiante.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { evaluaciones: true } } },
  })
  return NextResponse.json(estudiantes)
}

// Genera código anónimo: iniciales (apellidos + nombre) + sufijo de RUDE o aleatorio
function generarCodigo(nombre: string, apellido1: string, apellido2: string | null, rude?: string | null): string {
  const limpiar = (s: string) => s.trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase()
  const initials = [
    limpiar(apellido1)[0] ?? "X",
    apellido2 ? (limpiar(apellido2)[0] ?? "") : "",
    limpiar(nombre)[0] ?? "X",
  ].filter(Boolean).join("")

  // Sufijo: últimos 4 chars del RUDE si existe (solo alfanuméricos), si no, 4 random
  let sufijo: string
  if (rude && rude.trim().length > 0) {
    const clean = rude.replace(/[^A-Z0-9]/gi, "").toUpperCase()
    sufijo = clean.slice(-4).padStart(4, "0")
  } else {
    sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
  }

  return `${initials}-${sufijo}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    const docenteId = (session.user as any).id

    const raw = await req.json()
    const data = estudianteSchema.parse(raw)

    // Generar código único (reintentar si colisiona)
    let codigo = generarCodigo(data.nombre, data.apellido1, data.apellido2 ?? null, data.codigoRude ?? null)
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.estudiante.findUnique({ where: { codigo } })
      if (!exists) break
      const extra = Math.random().toString(36).slice(2, 4).toUpperCase()
      codigo = `${codigo}${extra}`
    }

    const estudiante = await prisma.estudiante.create({
      data: {
        ...data,
        fechaNac: typeof data.fechaNac === "string" ? new Date(data.fechaNac) : data.fechaNac,
        codigo,
        docenteId,
      },
    })
    return NextResponse.json(estudiante, { status: 201 })
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return NextResponse.json(validationError(err), { status: 400 })
    }
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[estudiantes/POST]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
