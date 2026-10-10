import { NextRequest, NextResponse } from "next/server"
import { getAuthContext } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
import { familySchema } from "@/lib/family"
import { consumeTrial, TrialLimitError } from "@/lib/commercial"
import { queueNotice, sendNotice } from "@/lib/notifications"
import { waitUntil } from "@vercel/functions"

export async function POST(req: NextRequest) {
 const auth = await getAuthContext()
 if (!auth) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 })
 if (auth.role !== "FAMILIA") return NextResponse.json({ error: "Esta sección corresponde a cuentas de familia." }, { status: 403 })
 const parsed = familySchema.safeParse(await req.json().catch(() => null))
 if (!parsed.success) return NextResponse.json({ error: "Completa las seis respuestas, usa una edad de 6 a 12 años y confirma tu autorización." }, { status: 400 })
 const data = parsed.data
 try {
  const result = await prisma.$transaction(async tx => {
   const existing = await tx.observacionFamiliar.findUnique({ where: { id: data.id } })
   if (existing) {
    if (existing.usuarioId !== auth.userId) throw new Error("FORBIDDEN")
    return tx.observacionFamiliar.update({ where: { id: data.id }, data: { alias: data.alias, edad: data.edad, respuestas: JSON.stringify(data.respuestas) } })
   }
   await consumeTrial(tx, auth.userId, "evaluacionesUsadas")
   const created = await tx.observacionFamiliar.create({ data: { id: data.id, usuarioId: auth.userId, alias: data.alias, edad: data.edad, respuestas: JSON.stringify(data.respuestas) } })
   await queueNotice(tx, `familia-${created.id}`, "Nuevo registro familiar", ["Una familia completó una observación en casa.", `Cuenta: ${auth.email}`, "No se incluyen respuestas ni datos del niño o la niña."])
   return created
  })
  waitUntil(sendNotice(`familia-${result.id}`))
  return NextResponse.json({ id: result.id, href: `/familia/${result.id}` })
 } catch (e) {
  if (e instanceof TrialLimitError) return NextResponse.json({ error: "La prueba incluye un registro familiar. Puedes editarlo o solicitar acceso para continuar el seguimiento.", href: "/suscripcion" }, { status: 403 })
  if (e instanceof Error && e.message === "FORBIDDEN") return NextResponse.json({ error: "No autorizado." }, { status: 403 })
  return NextResponse.json({ error: "No se pudo guardar. Conserva esta página abierta y vuelve a intentar." }, { status: 503 })
 }
}

export async function DELETE(req: NextRequest) {
 const auth = await getAuthContext()
 if (!auth) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 })
 if (auth.role !== "FAMILIA") return NextResponse.json({ error: "No autorizado." }, { status: 403 })
 const id = new URL(req.url).searchParams.get("id")
 if (!id) return NextResponse.json({ error: "Falta el registro." }, { status: 400 })
 const deleted = await prisma.observacionFamiliar.deleteMany({ where: { id, usuarioId: auth.userId } })
 return NextResponse.json(deleted.count ? { ok: true } : { error: "Registro no encontrado." }, { status: deleted.count ? 200 : 404 })
}
