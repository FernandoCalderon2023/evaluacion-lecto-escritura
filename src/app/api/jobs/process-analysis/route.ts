import { NextRequest, NextResponse } from "next/server"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { procesarAnalisis } from "@/lib/ai/procesarAnalisis"

import { AnalysisBusyError, AnalysisAlreadyRunning, publicAnalysisError } from "@/lib/ai/capacity"
import { prisma } from "@/lib/prisma"

export const maxDuration = 300

async function handler(req: NextRequest) {
  let body: { jobId: string; evaluacionId: string }
  try {
    body = await req.json()
    if (!body || typeof body.jobId !== "string" || typeof body.evaluacionId !== "string" || !body.jobId || !body.evaluacionId) throw new Error()
  } catch { return NextResponse.json({ ok: false, error: "Solicitud inválida" }, { status: 489, headers: { "Upstash-NonRetryable-Error": "true" } }) }
  try {
    await procesarAnalisis(body.jobId, body.evaluacionId)
    return NextResponse.json({ ok: true, jobId: body.jobId })
  } catch (err) {
    if (err instanceof AnalysisAlreadyRunning) return NextResponse.json({ ok: true, status: "processing" }, { status: 202 })
    if (err instanceof AnalysisBusyError) {
      if (Number(req.headers.get("Upstash-Retried") || 0) >= 5) {
        await prisma.analysisJob.updateMany({ where: { id: body.jobId, evaluacionId: body.evaluacionId, status: "queued" }, data: { status: "failed", activeKey: null, error: "La capacidad estuvo ocupada. Solicita nuevamente el informe.", completedAt: new Date() } })
        return NextResponse.json({ ok: false, status: "failed" })
      }
      return NextResponse.json({ ok: false, code: "AI_BUSY" }, { status: 503, headers: { "Retry-After": "60" } })
    }
    const error = publicAnalysisError(err)
    const job = await prisma.analysisJob.findFirst({ where: { id: body.jobId, evaluacionId: body.evaluacionId }, select: { status: true } }).catch(() => null)
    // Do not acknowledge a database outage before a terminal state was saved.
    if (!job || job.status === "queued" || job.status === "processing") {
      return NextResponse.json({ ok: false, code: error.code }, { status: 503, headers: { "Retry-After": "60" } })
    }
    // A terminal failure has been persisted; do not pay for another generation.
    return NextResponse.json({ ok: false, error: error.message, jobId: body.jobId })
  }
}

// Verificación de firma QStash.
//  - Con signing key: verificación OBLIGATORIA (verifySignatureAppRouter).
//  - Sin signing key en producción: fail-closed (503) para no dejar el worker abierto.
//  - Sin signing key en desarrollo: se permite (para pruebas locales sin QStash).
const hasSigningKey = !!process.env.QSTASH_CURRENT_SIGNING_KEY
const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"

async function rejectUnconfigured() {
  return NextResponse.json(
    { error: "Worker no configurado: falta QSTASH_CURRENT_SIGNING_KEY" },
    { status: 503 },
  )
}

export const POST = hasSigningKey
  ? verifySignatureAppRouter(handler)
  : isProd
    ? rejectUnconfigured
    : handler
