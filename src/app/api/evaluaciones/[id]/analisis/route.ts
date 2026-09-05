import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { aiRateLimit, checkRateLimit } from "@/lib/ratelimit"
import { getQStash, getAppUrl } from "@/lib/qstash"
import { procesarAnalisis } from "@/lib/ai/procesarAnalisis"

// Normalmente solo encolamos (rápido). Pero si la cola no está disponible,
// procesamos inline (~40 s), por eso el tope alto.
export const maxDuration = 300

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

    // Rate limit: 20 IA por hora por usuario
    const rl = await checkRateLimit(aiRateLimit, `user:${docenteId}`)
    if (!rl.allowed) {
      return NextResponse.json({
        error: `Has alcanzado el límite de 20 análisis IA por hora. Intenta en ${Math.ceil(rl.retryAfterSeconds / 60)} minutos.`,
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
          // FlowControl: máximo 5 jobs procesando en paralelo al proveedor de IA.
          // Previene 429 (rate limit) y mantiene la cola ordenada.
          flowControl: {
            key: "ai-analysis",
            parallelism: 5,
          },
        })
        return NextResponse.json({ jobId: job.id, status: "queued", queued: true })
      } catch (err) {
        // RESPALDO: si la cola no está disponible (p. ej. cuota diaria de QStash
        // agotada → "daily ratelimit exceeded"), NO abortamos: procesamos inline.
        // Tarda ~40 s (maxDuration lo cubre) y la UI recibe el análisis directo
        // en la respuesta, sin necesidad de polling.
        console.error("[analisis] QStash no disponible, procesando inline:", err instanceof Error ? err.message : err)
        const analisis = await procesarAnalisis(job.id, params.id)
        return NextResponse.json({ jobId: job.id, status: "done", analisis, inline: true })
      }
    } else {
      // Sin QStash configurado: procesar inline (nunca dejar un job "queued" para siempre).
      const analisis = await procesarAnalisis(job.id, params.id)
      return NextResponse.json({ jobId: job.id, status: "done", analisis, inline: true })
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
