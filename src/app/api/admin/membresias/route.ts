import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/apiAuth"
import { logAudit, getRequestContext } from "@/lib/audit"

export const dynamic = "force-dynamic"

const ROLES_ASIGNABLES = ["DOCENTE", "DIRECTOR", "DISTRITAL", "DEPARTAMENTAL"]

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const membresias = await prisma.membership.findMany({
    select: { id: true, usuarioId: true, organizacionId: true, rol: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(membresias)
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  try {
    const body = await req.json()
    const usuarioId = String(body?.usuarioId ?? "")
    const organizacionId = String(body?.organizacionId ?? "")
    const rol = String(body?.rol ?? "")
    if (!usuarioId || !organizacionId) {
      return NextResponse.json({ error: "usuarioId y organizacionId requeridos" }, { status: 400 })
    }
    if (!ROLES_ASIGNABLES.includes(rol)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 })
    }

    // Un usuario tiene un solo rol por organización (unique). Upsert manual.
    const existente = await prisma.membership.findFirst({ where: { usuarioId, organizacionId } })
    const m = existente
      ? await prisma.membership.update({ where: { id: existente.id }, data: { rol } })
      : await prisma.membership.create({ data: { usuarioId, organizacionId, rol } })

    logAudit({
      actorId: gate.auth.userId,
      actorEmail: gate.auth.email,
      action: "assign_role",
      target: usuarioId,
      metadata: { organizacionId, rol },
      ...getRequestContext(req),
    })
    return NextResponse.json(m, { status: existente ? 200 : 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[admin/membresias/POST]", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response

  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 })

  await prisma.membership.delete({ where: { id } }).catch(() => {})
  logAudit({
    actorId: gate.auth.userId,
    actorEmail: gate.auth.email,
    action: "remove_role",
    target: id,
    ...getRequestContext(req),
  })
  return NextResponse.json({ ok: true })
}
