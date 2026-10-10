import { classificationSelect } from "@/lib/classificationSelect"
import { NextResponse } from "next/server"
import { summarizeStudents } from "@/lib/dashboardSummary"
import { prisma } from "@/lib/prisma"
import { getAuthContext, unauthorizedResponse, resolveScope } from "@/lib/apiAuth"

export const dynamic = "force-dynamic"

export async function GET() {
  const auth = await getAuthContext()
  if (auth?.role === "FAMILIA") return NextResponse.json({ error: "Esta función corresponde al espacio profesional." }, { status: 403 })
  if (!auth) return unauthorizedResponse()

  // Scope jerárquico agregado (docente / director / distrital / departamental / admin).
  const scope = await resolveScope(auth, "aggregate")

  const [students, totalEvaluaciones] = await Promise.all([
    prisma.estudiante.findMany({
      where: scope,
      select: { evaluaciones: { select: classificationSelect, where: scope, orderBy: [{ fecha: "desc" }, { createdAt: "desc" }, { id: "desc" }], take: 1 } },
    }),
    prisma.evaluacion.count({ where: { AND: [scope, { estudiante: scope }] } }),
  ])
  return NextResponse.json({ totalEstudiantes: students.length, totalEvaluaciones, porEstado: summarizeStudents(students as any) })
}
