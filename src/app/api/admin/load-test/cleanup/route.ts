import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/apiAuth"

export const maxDuration = 30

/**
 * Limpia un batch de load test: borra evaluaciones, jobs y estudiantes.
 * Auth: token=NEXTAUTH_SECRET
 */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const url = new URL(req.url)

  const batchId = url.searchParams.get("batchId")
  if (!batchId || !batchId.startsWith("LOADTEST-")) {
    return NextResponse.json({
      error: "batchId requerido y debe empezar con LOADTEST-",
    }, { status: 400 })
  }

  try {
    // 1. Encontrar estudiantes del batch
    const estudiantes = await prisma.estudiante.findMany({
      where: { codigo: { startsWith: `${batchId}-` } },
      select: { id: true },
    })
    const estIds = estudiantes.map((e) => e.id)

    // 2. Encontrar evaluaciones
    const evaluaciones = await prisma.evaluacion.findMany({
      where: { estudianteId: { in: estIds } },
      select: { id: true },
    })
    const evIds = evaluaciones.map((e) => e.id)

    // 3. Borrar jobs (primero, FK)
    const deletedJobs = await prisma.analysisJob.deleteMany({
      where: { evaluacionId: { in: evIds } },
    })

    // 4. Borrar evaluaciones
    const deletedEvals = await prisma.evaluacion.deleteMany({
      where: { id: { in: evIds } },
    })

    // 5. Borrar estudiantes
    const deletedEsts = await prisma.estudiante.deleteMany({
      where: { id: { in: estIds } },
    })

    return NextResponse.json({
      ok: true,
      batchId,
      deleted: {
        jobs: deletedJobs.count,
        evaluaciones: deletedEvals.count,
        estudiantes: deletedEsts.count,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
