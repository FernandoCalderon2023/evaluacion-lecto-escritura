import { InstitutionUserForm } from "@/components/institucion/InstitutionForms"
import { requireAdmin } from "@/lib/apiAuth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
export const dynamic = "force-dynamic"
import { RolesPanel } from "@/components/admin/RolesPanel"
export default async function Page() {
 if (!(await requireAdmin()).ok) redirect("/dashboard")
 const usuarios = await prisma.usuario.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true, email: true } })
 return <><h1 className="text-2xl font-bold">Organizaciones y roles</h1><p className="text-sm text-slate-500">Configura departamentos, distritos, unidades educativas y responsables.</p><InstitutionUserForm provision/><RolesPanel usuarios={usuarios}/></>
}
