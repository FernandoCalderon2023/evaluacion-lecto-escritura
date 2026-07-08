import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/apiAuth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const url = new URL(req.url)

  const batchId = url.searchParams.get("batchId")
  if (!batchId) return NextResponse.json({ error: "batchId requerido" }, { status: 400 })

  const estudiantes = await prisma.estudiante.findMany({
    where: { codigo: { startsWith: `${batchId}-` } },
    select: { id: true },
  })
  const evIds = (await prisma.evaluacion.findMany({
    where: { estudianteId: { in: estudiantes.map((e) => e.id) } },
    select: { id: true },
  })).map((e) => e.id)

  // Jobs detallados con tiempo desde startedAt
  const jobs = await prisma.analysisJob.findMany({
    where: { evaluacionId: { in: evIds } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      status: true,
      error: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  const now = Date.now()
  const detail = jobs.map((j, i) => {
    const startedSecondsAgo = j.startedAt ? Math.round((now - j.startedAt.getTime()) / 1000) : null
    const elapsedMs =
      j.completedAt && j.startedAt
        ? j.completedAt.getTime() - j.startedAt.getTime()
        : j.startedAt
        ? now - j.startedAt.getTime()
        : null
    return {
      i: i + 1,
      id: j.id.slice(-8),
      status: j.status,
      startedAgoS: startedSecondsAgo,
      elapsedMs,
      error: j.error?.slice(0, 100),
    }
  })

  return NextResponse.json({
    batchId,
    totalJobs: jobs.length,
    processing: detail.filter((d) => d.status === "processing"),
    failed: detail.filter((d) => d.status === "failed"),
    recentDone: detail.filter((d) => d.status === "done").slice(-3),
    queued: detail.filter((d) => d.status === "queued").length,
  })
}
