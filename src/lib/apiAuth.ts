import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

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
