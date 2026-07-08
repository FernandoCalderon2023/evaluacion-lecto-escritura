import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/apiAuth"
import { crearOrganizacion } from "@/lib/organizaciones"

export const dynamic = "force-dynamic"

const TIPOS = ["DEPARTAMENTO", "DISTRITO", "UNIDAD_EDUCATIVA", "RED"]

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const orgs = await prisma.organizacion.findMany({
    select: { id: true, nombre: true, tipo: true, parentId: true, path: true, activo: true },
    orderBy: [{ tipo: "asc" }, { nombre: "asc" }],
  })
  return NextResponse.json(orgs)
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  try {
    const body = await req.json()
    const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : ""
    const tipo = typeof body?.tipo === "string" ? body.tipo : ""
    if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })
    if (!TIPOS.includes(tipo)) return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })

    const org = await crearOrganizacion({
      nombre,
      tipo,
      parentId: body?.parentId || null,
      codigoSie: body?.codigoSie || null,
    })
    return NextResponse.json(org, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[admin/organizaciones/POST]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
