import { requireAdmin } from "@/lib/apiAuth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
export const dynamic = "force-dynamic"
import { SubscriptionRequests } from "@/components/admin/SubscriptionRequests"
export default async function Page() {
 if (!(await requireAdmin()).ok) redirect("/dashboard")
 const requests = await prisma.accesoComercial.findMany({ where: { solicitadoEn: { not: null } }, orderBy: { solicitadoEn: "desc" }, include: { usuario: { select: { nombre: true, email: true } } } })
 return <><h1 className="text-2xl font-bold">Solicitudes</h1><SubscriptionRequests requests={requests.map(r => ({ ...r, solicitadoEn: r.solicitadoEn?.toISOString() ?? null }))}/></>
}
