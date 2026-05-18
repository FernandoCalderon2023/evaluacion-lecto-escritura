import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Exporta todos los reportes IA generados en un batch de load test.
 * Devuelve JSON con el código del estudiante, datos de evaluación y análisis IA.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = (url.searchParams.get("token") || "").trim()
  const expected = (process.env.NEXTAUTH_SECRET || "").trim()
  if (token !== expected) {
    return NextResponse.json({ error: "Token inválido" }, { status: 403 })
  }

  const batchId = url.searchParams.get("batchId")
  if (!batchId) return NextResponse.json({ error: "batchId requerido" }, { status: 400 })

  const estudiantes = await prisma.estudiante.findMany({
    where: { codigo: { startsWith: `${batchId}-` } },
    select: {
      id: true,
      codigo: true,
      sexo: true,
      grado: true,
      fechaNac: true,
    },
  })

  const reportes = []
  for (const est of estudiantes) {
    const ev = await prisma.evaluacion.findFirst({
      where: { estudianteId: est.id },
      orderBy: { createdAt: "desc" },
    })
    if (!ev) continue

    const job = await prisma.analysisJob.findFirst({
      where: { evaluacionId: ev.id },
      orderBy: { createdAt: "desc" },
    })

    reportes.push({
      codigo: est.codigo,
      sexo: est.sexo,
      grado: est.grado,
      edadAlEvaluar: ev.edadAlEvaluar,
      anioEscolar: ev.anioEscolar,
      observaciones: ev.observaciones,
      jobStatus: job?.status ?? "no-job",
      jobError: job?.error ?? null,
      jobStartedAt: job?.startedAt,
      jobCompletedAt: job?.completedAt,
      durationMs:
        job?.startedAt && job?.completedAt
          ? job.completedAt.getTime() - job.startedAt.getTime()
          : null,
      estadoAprendizaje: ev.estadoAprendizaje,
      analisis: ev.analisisIA ? JSON.parse(ev.analisisIA) : null,
    })
  }

  return NextResponse.json({
    batchId,
    total: reportes.length,
    conAnalisis: reportes.filter((r) => r.analisis != null).length,
    reportes,
  })
}
