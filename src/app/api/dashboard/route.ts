import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const [totalEstudiantes, totalEvaluaciones, porEstado] = await Promise.all([
    prisma.estudiante.count(),
    prisma.evaluacion.count(),
    prisma.evaluacion.groupBy({
      by: ["estadoAprendizaje"],
      _count: { _all: true },
    }),
  ])

  const estadoMap: Record<string, number> = {}
  for (const row of porEstado) {
    estadoMap[row.estadoAprendizaje ?? "sin-evaluar"] = row._count._all
  }

  return NextResponse.json({ totalEstudiantes, totalEvaluaciones, porEstado: estadoMap })
}
