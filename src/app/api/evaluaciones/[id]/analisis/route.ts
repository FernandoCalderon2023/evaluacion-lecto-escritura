import { randomUUID } from "node:crypto"
import { calcularScores } from "@/lib/scoring"
import { readGuardedReport } from "@/lib/ai/reportGuard"
import { isTrial, subscriptionRequired } from "@/lib/commercial"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { aiCapacity, expireAnalysisJobs, AnalysisError, AnalysisBusyError, publicAnalysisError } from "@/lib/ai/capacity"
import { getQStash, getAppUrl } from "@/lib/qstash"
import { procesarAnalisis } from "@/lib/ai/procesarAnalisis"

// Inline and queued workers share the same database admission control.
export const maxDuration = 300

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role === "FAMILIA") return NextResponse.json({ error: "Esta función corresponde al espacio profesional." }, { status: 403 })
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }
    const isAdmin = (session.user as any).role === "ADMIN"
    const docenteId = (session.user as any).id
    if (await isTrial(docenteId)) return subscriptionRequired()

    // Verificar acceso a la evaluación
    const ev = await prisma.evaluacion.findUnique({ where: { id: params.id } })
    if (!ev) return NextResponse.json({ error: "Evaluación no encontrada" }, { status: 404 })
    if (!isAdmin && ev.docenteId !== docenteId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await req.text()
    let regenerate = false
    if (body) {
      try { const parsed = JSON.parse(body); if (typeof parsed.regenerar !== "boolean" || Object.keys(parsed).some(k => k !== "regenerar")) throw new Error(); regenerate = parsed.regenerar }
      catch { return NextResponse.json({ error: "Solicitud de análisis inválida." }, { status: 400 }) }
    }
    if (!regenerate && ev.analisisIA) {
      const cached = readGuardedReport(ev.analisisIA, calcularScores(ev as any))
      if (cached) return NextResponse.json({ status: "done", analisis: cached, cached: true, analisisGeneradoEn: ev.analisisGeneradoEn })
    }
    await expireAnalysisJobs(params.id)
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

    // An atomic insert avoids a read/create race and exception-based contention.
    const job = { id: randomUUID() }
    const now = new Date()
    const inserted = await prisma.$executeRaw`
      INSERT INTO "AnalysisJob" ("id", "evaluacionId", "docenteId", "status", "activeKey", "createdAt", "updatedAt")
      VALUES (${job.id}, ${params.id}, ${docenteId}, 'queued', ${params.id}, ${now}, ${now})
      ON CONFLICT ("activeKey") DO NOTHING
    `
    if (!inserted) {
      const shared = await prisma.analysisJob.findFirst({ where: { evaluacionId: params.id }, orderBy: { createdAt: "desc" } })
      if (!shared) throw new AnalysisError("AI_JOB_UNAVAILABLE", "No se pudo iniciar el informe. Vuelve a intentar.")
      return NextResponse.json({ jobId: shared.id, status: shared.status, queued: true })
    }

    if (aiCapacity().queueMode === "qstash") {
      try {
        const qstash = getQStash()
        if (!qstash || !process.env.QSTASH_CURRENT_SIGNING_KEY) throw new Error("Queue unavailable")
        await qstash.publishJSON({
          url: `${getAppUrl()}/api/jobs/process-analysis`,
          body: { jobId: job.id, evaluacionId: params.id },
          deduplicationId: job.id,
          retries: 5,
          retryDelay: "60000",
          flowControl: { key: "ai-analysis", parallelism: aiCapacity().parallelism },
        })
        return NextResponse.json({ jobId: job.id, status: "queued", queued: true })
      } catch {
        // A timed-out publish can have been delivered. Only release an unclaimed job.
        const cancelled = await prisma.analysisJob.updateMany({ where: { id: job.id, status: "queued" }, data: { status: "failed", activeKey: null, error: "La cola no está disponible. Intenta más tarde.", completedAt: new Date() } })
        if (!cancelled.count) return NextResponse.json({ jobId: job.id, status: "processing", queued: true })
        throw new AnalysisError("AI_QUEUE_UNAVAILABLE", "La cola no está disponible. Tus datos están guardados; intenta más tarde.")
      }
    }
    try {
      const analisis = await procesarAnalisis(job.id, params.id)
      return NextResponse.json({ jobId: job.id, status: "done", analisis, inline: true })
    } catch (error) {
      if (error instanceof AnalysisBusyError) {
        await prisma.analysisJob.updateMany({ where: { id: job.id, status: "queued" }, data: { status: "failed", activeKey: null, error: error.message, completedAt: new Date() } })
      }
      throw error
    }
  } catch (err: unknown) {
    const error = publicAnalysisError(err)
    console.error("[analisis/route]", error.code)
    return NextResponse.json({ error: error.message, code: error.code, retryAfterSeconds: error.retryAfter }, { status: error.status, headers: { "Retry-After": String(error.retryAfter) } })
  }
}

/**
 * GET /api/evaluaciones/[id]/analisis
 * Devuelve el análisis IA ya generado (si existe).
 */
export async function GET(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role === "FAMILIA") return NextResponse.json({ error: "Esta función corresponde al espacio profesional." }, { status: 403 })
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const ev = await prisma.evaluacion.findUnique({ where: { id: params.id } })
  if (!ev) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const isAdmin = (session.user as any).role === "ADMIN"
  const docenteId = (session.user as any).id
  if (await isTrial(docenteId)) return subscriptionRequired()
  if (!isAdmin && ev.docenteId !== docenteId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  return NextResponse.json({
    analisis: readGuardedReport(ev.analisisIA, calcularScores(ev as any)),
    analisisGeneradoEn: ev.analisisGeneradoEn,
  })
}
