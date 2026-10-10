import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard")
  return <div className="p-4 lg:p-8 space-y-6"><header><p className="text-xs font-semibold uppercase tracking-widest text-viria-700">Gestión de SIDEDA</p><p className="mt-2 text-sm text-slate-500">Administra cuentas, organizaciones y solicitudes. Cambia al espacio de evaluación para consultar estudiantes y resultados.</p></header>{children}</div>
}
