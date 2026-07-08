import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Contexto de autenticación resuelto desde la sesión de NextAuth.
 * Base de la autorización por recurso (Fase 0 de seguridad).
 */
export type AuthContext = {
  userId: string
  role: string
  isAdmin: boolean
  email: string | null
}

/** Devuelve el contexto de sesión, o null si no hay sesión válida. */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; role?: string; email?: string | null } | undefined
  if (!user?.id) return null
  const role = user.role ?? "DOCENTE"
  return {
    userId: user.id,
    role,
    isAdmin: role === "ADMIN",
    email: user.email ?? null,
  }
}

export const unauthorizedResponse = () =>
  NextResponse.json({ error: "No autenticado" }, { status: 401 })

export const forbiddenResponse = () =>
  NextResponse.json({ error: "No autorizado" }, { status: 403 })

/**
 * Filtro de propiedad para queries de lista.
 * Admin ve todo; un docente solo ve lo suyo (docenteId).
 */
export function ownerScope(auth: AuthContext): { docenteId?: string } {
  return auth.isAdmin ? {} : { docenteId: auth.userId }
}

/** True si el recurso pertenece al usuario, o si es admin. */
export function canAccessResource(
  auth: AuthContext,
  resourceOwnerId: string | null | undefined,
): boolean {
  return auth.isAdmin || (resourceOwnerId != null && resourceOwnerId === auth.userId)
}

type AdminGate =
  | { ok: true; auth: AuthContext }
  | { ok: false; response: NextResponse }

/** Gate para endpoints solo-admin: reemplaza el anti-patrón ?token=NEXTAUTH_SECRET. */
export async function requireAdmin(): Promise<AdminGate> {
  const auth = await getAuthContext()
  if (!auth) return { ok: false, response: unauthorizedResponse() }
  if (!auth.isAdmin) return { ok: false, response: forbiddenResponse() }
  return { ok: true, auth }
}

// ─────────────────────────────────────────────────────────────
// Multi-tenant (Fase 1.2) — scope jerárquico por Membership
// ─────────────────────────────────────────────────────────────

export const ROLES = {
  DOCENTE: "DOCENTE",
  DIRECTOR: "DIRECTOR",
  DISTRITAL: "DISTRITAL",
  DEPARTAMENTAL: "DEPARTAMENTAL",
  ADMIN: "ADMIN",
} as const

export type ScopeMode = "individual" | "aggregate"

/**
 * Filtro Prisma según el/los rol(es) del usuario (basado en Membership).
 *  - "individual" (listas con PII): docente = lo suyo; director = su U.E.; admin = todo.
 *  - "aggregate"  (dashboard): además distrital/departamental = su subárbol de U.E.
 * Compatibilidad: sin membresías → filtra por docenteId (comportamiento previo a Fase 1.2).
 * Regla de privacidad: distrital/departamental NUNCA acceden a PII individual (solo agregados).
 */
export async function resolveScope(auth: AuthContext, mode: ScopeMode = "individual"): Promise<any> {
  if (auth.isAdmin) return {}

  const ms = await prisma.membership.findMany({
    where: { usuarioId: auth.userId },
    select: { organizacionId: true, rol: true },
  })
  if (ms.length === 0) return { docenteId: auth.userId }

  const ueIds = new Set<string>()
  for (const m of ms) {
    if (m.rol === ROLES.DIRECTOR) {
      ueIds.add(m.organizacionId)
    } else if (mode === "aggregate" && (m.rol === ROLES.DISTRITAL || m.rol === ROLES.DEPARTAMENTAL)) {
      const node = await prisma.organizacion.findUnique({ where: { id: m.organizacionId }, select: { id: true, path: true } })
      const prefix = node?.path || node?.id
      if (prefix) {
        const hijas = await prisma.organizacion.findMany({
          where: { tipo: "UNIDAD_EDUCATIVA", path: { startsWith: prefix } },
          select: { id: true },
        })
        hijas.forEach((h) => ueIds.add(h.id))
      }
    }
  }

  const or: any[] = [{ docenteId: auth.userId }]
  if (ueIds.size > 0) or.push({ unidadEducativaId: { in: Array.from(ueIds) } })
  return { OR: or }
}

/** ¿Puede VER (lectura) este recurso? Dueño, admin, o director de su U.E. */
export async function canViewInScope(
  auth: AuthContext,
  resource: { docenteId: string | null; unidadEducativaId: string | null },
): Promise<boolean> {
  if (auth.isAdmin) return true
  if (resource.docenteId && resource.docenteId === auth.userId) return true
  if (resource.unidadEducativaId) {
    const m = await prisma.membership.findFirst({
      where: { usuarioId: auth.userId, organizacionId: resource.unidadEducativaId, rol: ROLES.DIRECTOR },
      select: { id: true },
    })
    if (m) return true
  }
  return false
}
