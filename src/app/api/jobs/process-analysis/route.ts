import { NextRequest, NextResponse } from "next/server"
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { procesarAnalisis } from "@/lib/ai/procesarAnalisis"

export const maxDuration = 300

/**
 * Worker QStash: procesa un job de análisis IA.
 *
 * La lógica de generación vive en @/lib/ai/procesarAnalisis, compartida con el
 * respaldo inline del endpoint de encolar (para cuando la cola no está disponible).
 */
async function handler(req: NextRequest) {
  let jobId = "unknown"
  try {
    const body = (await req.json()) as { jobId: string; evaluacionId: string }
    jobId = body.jobId
    await procesarAnalisis(body.jobId, body.evaluacionId)
    return NextResponse.json({ ok: true, jobId })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[process-analysis] Error:", msg)
    // procesarAnalisis ya dejó el job en "failed" y reportó a Sentry.
    return NextResponse.json({ ok: false, error: msg, jobId }, { status: 200 })
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
