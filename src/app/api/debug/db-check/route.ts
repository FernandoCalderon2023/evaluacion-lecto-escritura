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
  const token = new URL(req.url).searchParams.get("token")
  if (token !== "diag-3f9a2c-temporal") {
    return NextResponse.json({ error: "no autorizado" }, { status: 403 })
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
