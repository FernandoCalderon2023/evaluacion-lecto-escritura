import { consumeInstitution } from "@/lib/institution"
import { calcularScores } from "@/lib/scoring"
import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

export const TRIAL_LIMIT = 1
export const trialAccess = cache((userId: string) => prisma.accesoComercial.findUnique({ where: { usuarioId: userId } }))
export async function isTrial(userId: string) { return (await trialAccess(userId))?.estado === "PRUEBA" }
export class TrialLimitError extends Error {}
export const subscriptionRequired = () => NextResponse.json({ error: "Tu prueba incluye 1 estudiante y 1 evaluación con resumen. Solicita la suscripción para ampliar el acceso.", code: "SUBSCRIPTION_REQUIRED", href: "/suscripcion" }, { status: 403 })

// Increment and creation share a write transaction. Deletion never replenishes trial quotas.
export async function consumeTrial(tx: Prisma.TransactionClient, userId: string, kind: "estudiantesUsados" | "evaluacionesUsadas") {
  if (await consumeInstitution(tx, userId, kind === "evaluacionesUsadas")) return
  const access = await tx.accesoComercial.findUnique({ where: { usuarioId: userId } })
  if (!access || access.estado === "ACTIVO") return
  const changed = await tx.accesoComercial.updateMany({ where: { usuarioId: userId, estado: "PRUEBA", [kind]: { lt: TRIAL_LIMIT } }, data: { [kind]: { increment: 1 } } })
  if (!changed.count) throw new TrialLimitError()
}
export function withoutReport<T extends { analisisIA?: unknown; analisisGeneradoEn?: unknown }>(value: T): T {
  return { ...value, ...("estadoAprendizaje" in value ? { estadoAprendizaje: calcularScores(value as any).estadoGeneral } : {}), analisisIA: null, analisisGeneradoEn: null }
}
