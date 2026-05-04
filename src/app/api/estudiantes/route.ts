import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""

  const estudiantes = await prisma.estudiante.findMany({
    where: q
      ? {
          OR: [
            { codigo: { contains: q } },
            { nombre: { contains: q } },
            { apellido1: { contains: q } },
            { apellido2: { contains: q } },
          ],
        }
      : undefined,
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
    const body = await req.json()
    const session = await getServerSession(authOptions)
    const docenteId = (session?.user as any)?.id

    // Generar código único (reintentar si colisiona)
    let codigo = generarCodigo(body.nombre, body.apellido1, body.apellido2, body.codigoRude)
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.estudiante.findUnique({ where: { codigo } })
      if (!exists) break
      // En colisión, agregar sufijo random adicional
      const extra = Math.random().toString(36).slice(2, 4).toUpperCase()
      codigo = `${codigo}${extra}`
    }

    const estudiante = await prisma.estudiante.create({
      data: { ...body, codigo, docenteId },
    })
    return NextResponse.json(estudiante, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[estudiantes/POST]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
