import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export const NOTIFICATION_EMAIL = "fcalderon@vir-ia.com"
export function emailConfigured() { return !!(process.env.RESEND_API_KEY?.trim() && process.env.SYSTEM_EMAIL_FROM?.trim()) }
export async function queueNotice(tx: Prisma.TransactionClient, id: string, subject: string, lines: string[]) {
  await tx.avisoSistema.create({ data: { id, destinatario: NOTIFICATION_EMAIL, asunto: `SIDEDA · ${subject}`, texto: `Fernando Calderon,\n\n${lines.join("\n")}\n\nRevisa la cuenta y las solicitudes en https://sideda.com/admin\nEste aviso no contiene datos de estudiantes.` } })
}
// The durable outbox is written in the same transaction as the business event.
// A failed delivery never rolls back registration or loses the subscription request.
export async function sendNotice(id: string): Promise<boolean> {
  if (!emailConfigured()) return false
  try {
    const now = new Date()
    const claim = await prisma.avisoSistema.updateMany({ where: { id, estado: { not: "ENVIADO" }, OR: [{ bloqueoHasta: null }, { bloqueoHasta: { lt: now } }] }, data: { estado: "ENVIANDO", bloqueoHasta: new Date(Date.now()+60000), intentos: { increment: 1 } } })
    if (!claim.count) return false
    const item = await prisma.avisoSistema.findUniqueOrThrow({ where: { id } })
    try {
      const response = await fetch(process.env.RESEND_API_URL?.trim() || "https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`, "Content-Type": "application/json", "Idempotency-Key": `sideda/${item.id}` }, body: JSON.stringify({ from: process.env.SYSTEM_EMAIL_FROM!.trim(), to: [item.destinatario], subject: item.asunto, text: item.texto }), signal: AbortSignal.timeout(8000) })
      const result = await response.json().catch(()=>({}))
      if (!response.ok || typeof result.id !== "string") throw new Error(`Proveedor de correo: HTTP ${response.status}`)
      await prisma.avisoSistema.update({ where: { id }, data: { estado: "ENVIADO", enviadoEn: new Date(), proveedorId: result.id, ultimoError: null, bloqueoHasta: null } })
      return true
    } catch {
      await prisma.avisoSistema.update({ where: { id }, data: { estado: "PENDIENTE", ultimoError: "El proveedor no confirmó el envío. Se reintentará.", bloqueoHasta: null } })
      return false
    }
  } catch { return false }
}
export async function flushNotices() {
  if (!emailConfigured()) return { configured: false, sent: 0 }
  const items = await prisma.avisoSistema.findMany({ where: { estado: { not: "ENVIADO" }, OR: [{ bloqueoHasta: null }, { bloqueoHasta: { lt: new Date() } }] }, orderBy: { createdAt: "asc" }, take: 20, select: { id: true } })
  let sent = 0
  for (const item of items) if (await sendNotice(item.id)) sent++
  return { configured: true, sent }
}
