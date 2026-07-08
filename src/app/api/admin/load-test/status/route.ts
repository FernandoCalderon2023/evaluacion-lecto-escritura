import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/apiAuth"

export const dynamic = "force-dynamic"

/**
 * Estado de un batch de load test.
 * Agrupa los jobs por status y calcula tiempos.
 */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const url = new URL(req.url)

  const batchId = url.searchParams.get("batchId")
  if (!batchId) {
    return NextResponse.json({ error: "batchId requerido" }, { status: 400 })
  }

  // Buscar estudiantes del batch
  const estudiantes = await prisma.estudiante.findMany({
    where: { codigo: { startsWith: `${batchId}-` } },
    select: { id: true },
  })
  const estIds = estudiantes.map((e) => e.id)

  // Buscar jobs de las evaluaciones de esos estudiantes
  const evaluaciones = await prisma.evaluacion.findMany({
    where: { estudianteId: { in: estIds } },
    select: { id: true, analisisIA: true },
  })
  const evIds = evaluaciones.map((e) => e.id)
  const conAnalisis = evaluaciones.filter((e) => e.analisisIA != null).length

  const jobs = await prisma.analysisJob.findMany({
    where: { evaluacionId: { in: evIds } },
    select: {
      id: true,
      status: true,
      error: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
    },
  })

  // Estadísticas
  const byStatus = {
    queued: jobs.filter((j) => j.status === "queued").length,
    processing: jobs.filter((j) => j.status === "processing").length,
    done: jobs.filter((j) => j.status === "done").length,
    failed: jobs.filter((j) => j.status === "failed").length,
  }

  // Duraciones de los completados
  const completados = jobs.filter((j) => j.status === "done" && j.completedAt && j.startedAt)
  const duraciones = completados.map(
    (j) => j.completedAt!.getTime() - j.startedAt!.getTime()
  )
  const avgMs =
    duraciones.length > 0 ? duraciones.reduce((a, b) => a + b, 0) / duraciones.length : 0
  const minMs = duraciones.length > 0 ? Math.min(...duraciones) : 0
  const maxMs = duraciones.length > 0 ? Math.max(...duraciones) : 0

  // Errores agrupados
  const errores = jobs
    .filter((j) => j.status === "failed" && j.error)
    .reduce((acc, j) => {
      const err = j.error!.slice(0, 80)
      acc[err] = (acc[err] ?? 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Tiempo total del batch
  const oldestCreated = jobs.reduce(
    (acc, j) => (!acc || j.createdAt < acc ? j.createdAt : acc),
    null as Date | null
  )
  const newestCompleted = jobs
    .filter((j) => j.completedAt)
    .reduce(
      (acc, j) => (!acc || j.completedAt! > acc ? j.completedAt! : acc),
      null as Date | null
    )
  const totalElapsedMs =
    oldestCreated && newestCompleted
      ? newestCompleted.getTime() - oldestCreated.getTime()
      : oldestCreated
      ? Date.now() - oldestCreated.getTime()
      : 0

  const total = jobs.length
  const finished = byStatus.done + byStatus.failed
  const progress = total > 0 ? Math.round((finished / total) * 100) : 0

  return NextResponse.json({
    batchId,
    total,
    progress,
    byStatus,
    conAnalisis,
    durationStats: {
      avgMs: Math.round(avgMs),
      minMs,
      maxMs,
      completed: duraciones.length,
    },
    errores,
    totalElapsedMs,
    isComplete: total > 0 && byStatus.queued === 0 && byStatus.processing === 0,
  })
}
