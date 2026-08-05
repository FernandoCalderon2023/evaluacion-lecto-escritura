import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

/**
 * TEMPORAL — diagnóstico de por qué falla el login. Reporta (desde el runtime
 * REAL de la app en Vercel) qué base ve y si la credencial del admin coincide.
 * BORRAR después de diagnosticar.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get("token")
  if (token !== "diag-3f9a2c-temporal") {
    return NextResponse.json({ error: "no autorizado" }, { status: 403 })
  }

  // Acción: limpiar los contadores de rate-limit del login (destraba el bloqueo por muchos intentos)
  if (url.searchParams.get("action") === "clear-login") {
    try {
      const { redis } = await import("@/lib/ratelimit")
      if (!redis) return NextResponse.json({ cleared: false, reason: "sin redis" })
      let keys: string[] = []
      try {
        keys = await redis.keys("rl:login:*")
      } catch (e) {
        return NextResponse.json({ cleared: false, step: "keys", error: (e as Error).message })
      }
      let deleted = 0
      for (const k of keys) {
        try { await redis.del(k); deleted++ } catch { /* seguir con las demás */ }
      }
      return NextResponse.json({ cleared: true, encontradas: keys.length, borradas: deleted })
    } catch (e) {
      return NextResponse.json({ cleared: false, error: (e as Error).message })
    }
  }

  const out: Record<string, unknown> = {}
  try {
    out.userCount = await prisma.usuario.count()
    const admin = await prisma.usuario.findUnique({
      where: { email: "admin@sideda.com" },
      select: { activo: true, passwordHash: true, nombre: true },
    })
    out.adminExists = !!admin
    out.adminActivo = admin?.activo ?? null
    out.adminNombre = admin?.nombre ?? null
    out.hashPrefix = admin?.passwordHash?.slice(0, 7) ?? null
    out.passwordMatchesTemp = admin ? await bcrypt.compare("Sideda#Temp2026", admin.passwordHash) : null
    out.rateLimitConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    try { out.orgCount = await prisma.organizacion.count() } catch (e) { out.orgTableError = (e as Error).message.slice(0, 80) }
    try { out.membershipCount = await prisma.membership.count() } catch (e) { out.membershipTableError = (e as Error).message.slice(0, 80) }
  } catch (e) {
    out.error = (e as Error).message
  }
  return NextResponse.json(out)
}
