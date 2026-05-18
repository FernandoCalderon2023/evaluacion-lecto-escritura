import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

/**
 * Lista jobs activos y recientes para monitoreo en vivo.
 * Excluye jobs de LOADTEST.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = (url.searchParams.get("token") || "").trim()
  const expected = (process.env.NEXTAUTH_SECRET || "").trim()
  if (token !== expected) {
    return NextResponse.json({ error: "Token inválido" }, { status: 403 })
  }

  // Últimos 15 minutos de jobs (excluyendo loadtest)
  const since = new Date(Date.now() - 15 * 60 * 1000)

  // Obtener jobs de evaluaciones que NO son loadtest
  const jobs = await prisma.analysisJob.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      // No hay relación directa, hacemos query separada
    },
  })

  // Para cada job, traer estudiante (para excluir loadtest)
  const enriched = await Promise.all(
    jobs.map(async (job) => {
      const ev = await prisma.evaluacion.findUnique({
        where: { id: job.evaluacionId },
        select: {
          estudiante: { select: { codigo: true, nombre: true } },
          evaluador: true,
        },
      })
      return {
        jobId: job.id.slice(-10),
        status: job.status,
        codigo: ev?.estudiante?.codigo ?? "?",
        evaluador: ev?.evaluador ?? "?",
        createdAt: job.createdAt,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        durationMs:
          job.startedAt && job.completedAt
            ? job.completedAt.getTime() - job.startedAt.getTime()
            : job.startedAt
            ? Date.now() - job.startedAt.getTime()
            : null,
        ageSeconds: Math.round((Date.now() - job.createdAt.getTime()) / 1000),
        error: job.error?.slice(0, 200),
      }
    })
  )

  // Excluir loadtest
  const realJobs = enriched.filter(
    (j) => !j.codigo.startsWith("LOADTEST-")
  )

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    totalJobs: realJobs.length,
    byStatus: {
      queued: realJobs.filter((j) => j.status === "queued").length,
      processing: realJobs.filter((j) => j.status === "processing").length,
      done: realJobs.filter((j) => j.status === "done").length,
      failed: realJobs.filter((j) => j.status === "failed").length,
    },
    jobs: realJobs,
  })
}
