import { prisma } from "@/lib/prisma"

interface AuditEntry {
  actorId?: string | null
  actorEmail?: string | null
  action: string
  target?: string | null
  metadata?: Record<string, unknown>
  ip?: string | null
  userAgent?: string | null
}

/**
 * Registra una acción sensible en el audit log.
 * Nunca debe romper el flujo principal — si falla, solo loggeamos.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actorEmail: entry.actorEmail ?? null,
        action: entry.action,
        target: entry.target ?? null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
      },
    })
  } catch (err) {
    console.error("[audit] No se pudo registrar:", err)
  }
}

/**
 * Extrae IP y User-Agent de un Request para auditoría.
 */
export function getRequestContext(req: Request): { ip: string | null; userAgent: string | null } {
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : (req.headers.get("x-real-ip") ?? null)
  const userAgent = req.headers.get("user-agent") ?? null
  return { ip, userAgent }
}
