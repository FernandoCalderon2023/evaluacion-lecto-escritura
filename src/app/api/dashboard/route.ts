import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthContext, unauthorizedResponse, resolveScope } from "@/lib/apiAuth"

export const dynamic = "force-dynamic"

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  // Scope jerárquico agregado (docente / director / distrital / departamental / admin).
  const scope = await resolveScope(auth, "aggregate")

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
