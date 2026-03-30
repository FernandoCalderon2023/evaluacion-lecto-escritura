export const dynamic = "force-dynamic"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AdminPanel } from "@/components/admin/AdminPanel"

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
    </div>
  )
}
