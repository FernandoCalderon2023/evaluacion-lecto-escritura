import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { anthropic } from "@/lib/anthropic"
import { redis } from "@/lib/ratelimit"
import { requireAdmin } from "@/lib/apiAuth"

export const maxDuration = 30

/**
 * Pre-warming endpoint: invocar antes de un load test para "despertar" todas
 * las funciones serverless y conexiones críticas. Reduce cold start latency
 * de la primera ola de requests.
 *
 * Uso: curl https://sideda.com/api/admin/warmup?token=NEXTAUTH_SECRET
 */
export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const start = Date.now()
  const results: Record<string, { ok: boolean; ms?: number; error?: string }> = {}

  // 1. Warm-up DB (Turso)
  const dbStart = Date.now()
  try {
    await prisma.usuario.count()
    results.database = { ok: true, ms: Date.now() - dbStart }
  } catch (e) {
    results.database = { ok: false, error: (e as Error).message }
  }

  // 2. Warm-up Redis (Upstash)
  const redisStart = Date.now()
  try {
    if (redis) {
      await redis.ping()
      results.redis = { ok: true, ms: Date.now() - redisStart }
    } else {
      results.redis = { ok: false, error: "Redis no configurado" }
    }
  } catch (e) {
    results.redis = { ok: false, error: (e as Error).message }
  }

  // 3. Warm-up Anthropic (chequeo de auth, no genera)
  const aiStart = Date.now()
  try {
    // Sólo verifica que la key esté configurada — no generamos nada
    results.anthropic = {
      ok: !!process.env.ANTHROPIC_API_KEY,
      ms: Date.now() - aiStart,
    }
  } catch (e) {
    results.anthropic = { ok: false, error: (e as Error).message }
  }

  // 4. Warm-up del worker (HEAD request — no procesa)
  const workerStart = Date.now()
  try {
    const url = `${(process.env.NEXTAUTH_URL ?? "https://sideda.com").replace(/\/$/, "")}/api/jobs/process-analysis`
    const r = await fetch(url, { method: "GET" }).catch(() => null)
    results.worker = { ok: r !== null, ms: Date.now() - workerStart }
  } catch (e) {
    results.worker = { ok: false, error: (e as Error).message }
  }

  return NextResponse.json({
    ok: true,
    totalMs: Date.now() - start,
    results,
    ready: Object.values(results).every((r) => r.ok),
  })
}
