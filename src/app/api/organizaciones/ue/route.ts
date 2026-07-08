import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthContext, unauthorizedResponse } from "@/lib/apiAuth"

export const dynamic = "force-dynamic"

/**
 * Lista las Unidades Educativas existentes (para autocompletar en formularios).
 * Los nombres de colegio no son PII de menores; se devuelven a cualquier usuario
 * autenticado para sugerir y evitar duplicados de tipeo.
 */
export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedResponse()

  const ues = await prisma.organizacion.findMany({
    where: { tipo: "UNIDAD_EDUCATIVA", activo: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: "asc" },
  })
  return NextResponse.json(ues)
}
