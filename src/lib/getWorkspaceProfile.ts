import { cache } from "react"
import { prisma } from "@/lib/prisma"
import { workspaceProfile } from "./workspaceProfile"
export const getWorkspaceProfile = cache(async (userId: string, role: string) => {
  const assignments = role === "ADMIN" || role === "FAMILIA" ? [] : await prisma.membership.findMany({ where: { usuarioId: userId }, select: { rol: true } })
  return workspaceProfile(role, assignments.map(m => m.rol))
})
