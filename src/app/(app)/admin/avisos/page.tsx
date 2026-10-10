import { requireAdmin } from "@/lib/apiAuth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
export const dynamic = "force-dynamic"
import { NotificationStatus } from "@/components/admin/NotificationStatus"
import { emailConfigured, NOTIFICATION_EMAIL } from "@/lib/notifications"
export default async function Page() {
 if (!(await requireAdmin()).ok) redirect("/dashboard")
 const [pending, sent] = await Promise.all([prisma.avisoSistema.count({ where: { estado: { not: "ENVIADO" } } }), prisma.avisoSistema.count({ where: { estado: "ENVIADO" } })])
 return <><h1 className="text-2xl font-bold">Avisos del sistema</h1><NotificationStatus configured={emailConfigured()} pending={pending} sent={sent} email={NOTIFICATION_EMAIL}/></>
}
