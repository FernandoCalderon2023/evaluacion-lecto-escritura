import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""

  const estudiantes = await prisma.estudiante.findMany({
    where: q
      ? {
          OR: [
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

export async function POST(req: NextRequest) {
  const body = await req.json()
  const estudiante = await prisma.estudiante.create({ data: body })
  return NextResponse.json(estudiante, { status: 201 })
}
