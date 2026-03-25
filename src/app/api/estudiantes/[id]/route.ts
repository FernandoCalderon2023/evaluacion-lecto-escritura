import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const est = await prisma.estudiante.findUnique({
    where: { id: params.id },
    include: {
      evaluaciones: {
        orderBy: { fecha: "desc" },
        select: { id: true, fecha: true, evaluador: true, estadoAprendizaje: true, scoreCognitivo: true, scoreLexical: true },
      },
    },
  })
  if (!est) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(est)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const est = await prisma.estudiante.update({ where: { id: params.id }, data: body })
  return NextResponse.json(est)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.estudiante.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
