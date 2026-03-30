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
  const session = await getServerSession(authOptions)
  const docenteId = (session?.user as any)?.id
  const estudiante = await prisma.estudiante.create({ data: { ...body, docenteId } })
  return NextResponse.json(estudiante, { status: 201 })
}
