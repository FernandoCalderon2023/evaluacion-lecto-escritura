import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"

export const institutionalUserSchema = z.object({
  nombre: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(72),
}).strict()
export const institutionFor = (usuarioId: string) => prisma.institucionMiembro.findUnique({ where: { usuarioId }, include: { institucion: true } })
export class InstitutionLimitError extends Error {}

export async function consumeInstitution(tx: Prisma.TransactionClient, usuarioId: string, evaluation: boolean) {
  const member = await tx.institucionMiembro.findUnique({ where: { usuarioId }, include: { institucion: true } })
  if (!member) return false
  if (evaluation) {
    const changed = await tx.institucionPlan.updateMany({
      where: { id: member.institucionId, evaluacionesUsadas: { lt: member.institucion.limiteEvaluaciones } },
      data: { evaluacionesUsadas: { increment: 1 } },
    })
    if (!changed.count) throw new InstitutionLimitError("La institución utilizó sus 15 evaluaciones. Puedes consultar y corregir las existentes. Contacta al responsable para ampliar el paquete.")
    await tx.institucionMiembro.update({ where: { usuarioId }, data: { evaluacionesUsadas: { increment: 1 } } })
  }
  return true
}

export async function createInstitutionUser(tx: Prisma.TransactionClient, institucionId: string, data: { nombre: string; email: string; passwordHash: string }, gestor = false) {
  const plan = await tx.institucionPlan.findUniqueOrThrow({ where: { id: institucionId } })
  const reserved = await tx.institucionPlan.updateMany({ where: { id: institucionId, usuariosUsados: { lt: plan.limiteUsuarios } }, data: { usuariosUsados: { increment: 1 } } })
  if (!reserved.count) throw new InstitutionLimitError("La institución ya tiene sus 10 cuentas asignadas. Desactivar una cuenta conserva su plaza y sus registros.")
  const user = await tx.usuario.create({ data: { ...data, rol: "DOCENTE", accesoComercial: { create: { estado: "ACTIVO", activadoEn: new Date() } } }, select: { id: true, nombre: true, email: true, activo: true } })
  await tx.institucionMiembro.create({ data: { usuarioId: user.id, institucionId, gestor } })
  return user
}
