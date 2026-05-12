import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * GET /api/evaluaciones/[id]/analisis/status?jobId=X
 *
 * Devuelve el estado del job + el análisis si está completo.
 * El cliente hace polling cada 2-3 segundos.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const isAdmin = (session.user as any).role === "ADMIN"
  const docenteId = (session.user as any).id

  const ev = await prisma.evaluacion.findUnique({ where: { id: params.id } })
  if (!ev) return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
  if (!isAdmin && ev.docenteId !== docenteId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const jobId = new URL(req.url).searchParams.get("jobId")

  // Si pasaron jobId específico
  if (jobId) {
    const job = await prisma.analysisJob.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ status: "not_found" }, { status: 404 })

    if (job.status === "done") {
      return NextResponse.json({
        status: "done",
        analisis: ev.analisisIA ? JSON.parse(ev.analisisIA) : null,
      })
    }
    if (job.status === "failed") {
      return NextResponse.json({ status: "failed", error: job.error })
    }
    // queued o processing — informar posición en cola
    const posicion = await prisma.analysisJob.count({
      where: {
        status: { in: ["queued", "processing"] },
        createdAt: { lt: job.createdAt },
      },
    })
    return NextResponse.json({ status: job.status, posicion: posicion + 1 })
  }

  // Sin jobId: buscar el último job para esta evaluación
  const lastJob = await prisma.analysisJob.findFirst({
    where: { evaluacionId: params.id },
    orderBy: { createdAt: "desc" },
  })

  if (!lastJob) {
    return NextResponse.json({ status: "no_job", analisis: ev.analisisIA ? JSON.parse(ev.analisisIA) : null })
  }

  if (lastJob.status === "done") {
    return NextResponse.json({
      status: "done",
      analisis: ev.analisisIA ? JSON.parse(ev.analisisIA) : null,
    })
  }
  if (lastJob.status === "failed") {
    return NextResponse.json({ status: "failed", error: lastJob.error, jobId: lastJob.id })
  }

  return NextResponse.json({ status: lastJob.status, jobId: lastJob.id })
}
