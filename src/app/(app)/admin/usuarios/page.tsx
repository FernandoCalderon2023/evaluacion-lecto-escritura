import { requireAdmin } from "@/lib/apiAuth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
export const dynamic = "force-dynamic"
import { AdminPanel } from "@/components/admin/AdminPanel"
export default async function Page() {
 const gate = await requireAdmin(); if (!gate.ok) redirect("/dashboard")
 const usuarios = await prisma.usuario.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, email: true, nombre: true, rol: true, activo: true, createdAt: true } })
 return <><h1 className="text-2xl font-bold">Usuarios</h1><p className="text-sm text-slate-500">Gestiona las cuentas y su acceso.</p><AdminPanel usuarios={usuarios} currentUserId={gate.auth.userId}/></>
}
