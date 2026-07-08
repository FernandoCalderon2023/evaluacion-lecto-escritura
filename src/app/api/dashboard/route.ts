import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthContext, unauthorizedResponse, ownerScope } from "@/lib/apiAuth"

export const dynamic = "force-dynamic"

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  // Aislamiento por docente (admin ve el agregado global).
  const scope = ownerScope(auth)

  const [totalEstudiantes, totalEvaluaciones, porEstado] = await Promise.all([
    prisma.estudiante.count({ where: scope }),
    prisma.evaluacion.count({ where: scope }),
    prisma.evaluacion.groupBy({
      by: ["estadoAprendizaje"],
      where: scope,
      _count: { _all: true },
    }),
  ])

  const estadoMap: Record<string, number> = {}
  for (const row of porEstado) {
    estadoMap[row.estadoAprendizaje ?? "sin-evaluar"] = row._count._all
  }

  return NextResponse.json({ totalEstudiantes, totalEvaluaciones, porEstado: estadoMap })
}
