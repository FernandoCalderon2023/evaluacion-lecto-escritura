import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { aiRateLimit, checkRateLimit } from "@/lib/ratelimit"
import { getQStash, getAppUrl } from "@/lib/qstash"

export const maxDuration = 30 // ahora solo encolamos, no procesamos

/**
 * POST /api/evaluaciones/[id]/analisis
 *
 * Encola un trabajo de generación de IA. Devuelve un jobId que el cliente
 * usa para hacer polling a /api/evaluaciones/[id]/analisis/status?jobId=X
 *
 * Si QStash no está configurado, hace fallback al procesamiento sincrónico
 * (modo dev / sin cola).
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    const isAdmin = (session.user as any).role === "ADMIN"
    const docenteId = (session.user as any).id

    // Rate limit: 5 IA por hora por usuario
    const rl = await checkRateLimit(aiRateLimit, `user:${docenteId}`)
    if (!rl.allowed) {
      return NextResponse.json({
        error: `Has alcanzado el límite de 5 análisis IA por hora. Intenta en ${Math.ceil(rl.retryAfterSeconds / 60)} minutos.`,
        retryAfterSeconds: rl.retryAfterSeconds,
      }, {
        status: 429,
        headers: { "Retry-After": rl.retryAfterSeconds.toString() },
      })
    }

    // Verificar acceso a la evaluación
    const ev = await prisma.evaluacion.findUnique({ where: { id: params.id } })
    if (!ev) return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
    if (!isAdmin && ev.docenteId !== docenteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Si ya hay un job en cola/procesando para esta evaluación, devolverlo
    const existing = await prisma.analysisJob.findFirst({
      where: {
        evaluacionId: params.id,
        status: { in: ["queued", "processing"] },
      },
      orderBy: { createdAt: "desc" },
    })
    if (existing) {
      return NextResponse.json({ jobId: existing.id, status: existing.status, queued: true })
    }

    // Crear el job
    const job = await prisma.analysisJob.create({
      data: {
        evaluacionId: params.id,
        docenteId,
        status: "queued",
      },
    })

    const qstash = getQStash()
    if (qstash) {
      // Encolar con QStash
      const targetUrl = `${getAppUrl()}/api/jobs/process-analysis`
      try {
        await qstash.publishJSON({
          url: targetUrl,
          body: { jobId: job.id, evaluacionId: params.id },
          retries: 2,
        })
        return NextResponse.json({ jobId: job.id, status: "queued", queued: true })
      } catch (err) {
        // Si QStash falla, fallback a procesamiento inmediato vía API interna
        console.error("[analisis] QStash publish failed, fallback inline:", err)
        await prisma.analysisJob.update({
          where: { id: job.id },
          data: { status: "failed", error: "Cola no disponible. Reintenta." },
        })
        return NextResponse.json({
          error: "Cola de procesamiento no disponible. Intenta en unos segundos.",
        }, { status: 503 })
      }
    } else {
      // Sin QStash: marcamos como queued y el worker manual se encarga.
      // Esto NO debería pasar en producción.
      return NextResponse.json({ jobId: job.id, status: "queued", queued: true })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[analisis/route] Error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * GET /api/evaluaciones/[id]/analisis
 * Devuelve el análisis IA ya generado (si existe).
 */
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const ev = await prisma.evaluacion.findUnique({ where: { id: params.id } })
  if (!ev) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const isAdmin = (session.user as any).role === "ADMIN"
  const docenteId = (session.user as any).id
  if (!isAdmin && ev.docenteId !== docenteId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  return NextResponse.json({
    analisis: ev.analisisIA ? JSON.parse(ev.analisisIA) : null,
    analisisGeneradoEn: ev.analisisGeneradoEn,
  })
}
