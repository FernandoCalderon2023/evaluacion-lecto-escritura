export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminPanel } from "@/components/admin/AdminPanel"
import { RolesPanel } from "@/components/admin/RolesPanel"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== "ADMIN") redirect("/dashboard")

  const usuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      nombre: true,
      rol: true,
      activo: true,
      createdAt: true,
    },
  })

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Administración de Usuarios</h1>
        <p className="text-slate-500 text-sm mt-1">Crear, activar y desactivar cuentas de docentes</p>
      </div>
      <AdminPanel usuarios={usuarios} />

      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Organizaciones y roles</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">
          Creá la estructura (departamentos, distritos, unidades educativas) y asigná directores/as y distritales.
        </p>
        <RolesPanel usuarios={usuarios.map((u) => ({ id: u.id, nombre: u.nombre, email: u.email }))} />
      </div>
    </div>
  )
}
