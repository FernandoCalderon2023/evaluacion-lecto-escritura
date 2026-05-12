import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const maxDuration = 10

interface HealthCheck {
  status: "ok" | "degraded" | "down"
  timestamp: string
  uptime: number
  version: string
  checks: {
    database: { ok: boolean; latencyMs?: number; error?: string }
    anthropic: { ok: boolean; configured: boolean }
    auth: { ok: boolean; configured: boolean }
  }
}

const startTime = Date.now()

export async function GET() {
  const checks: HealthCheck["checks"] = {
    database: { ok: false },
    anthropic: { ok: false, configured: !!process.env.ANTHROPIC_API_KEY },
    auth: { ok: false, configured: !!process.env.NEXTAUTH_SECRET },
  }

  // DB check
  const dbStart = Date.now()
  try {
    await prisma.usuario.count()
    checks.database.ok = true
    checks.database.latencyMs = Date.now() - dbStart
  } catch (err) {
    checks.database.error = err instanceof Error ? err.message : "DB error"
  }

  // Anthropic check (solo verifica que la key esté configurada)
  checks.anthropic.ok = checks.anthropic.configured

  // Auth check
  checks.auth.ok = checks.auth.configured

  const allOk = checks.database.ok && checks.anthropic.ok && checks.auth.ok
  const status: HealthCheck["status"] = allOk
    ? "ok"
    : (checks.database.ok ? "degraded" : "down")

  const response: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
    checks,
  }

  const httpStatus = status === "ok" ? 200 : status === "degraded" ? 200 : 503
  return NextResponse.json(response, { status: httpStatus })
}
