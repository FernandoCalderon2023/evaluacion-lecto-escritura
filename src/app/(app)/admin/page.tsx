import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/apiAuth"
import { redirect } from "next/navigation"
export const dynamic = "force-dynamic"
export default async function AdminPage() {
  if (!(await requireAdmin()).ok) redirect("/dashboard")
  const [usuarios, solicitudes, avisos] = await Promise.all([
    prisma.usuario.count(),
    prisma.accesoComercial.count({ where: { solicitadoEn: { not: null }, estado: "PRUEBA" } }),
    prisma.avisoSistema.count({ where: { estado: { not: "ENVIADO" } } }),
  ])
  return <><h1 className="text-3xl font-semibold text-slate-900">Administración</h1><div className="grid gap-4 sm:grid-cols-2">{[
    { href: "/admin/usuarios", title: "Usuarios", detail: `${usuarios} cuentas registradas`, text: "Crea cuentas y gestiona su acceso a la plataforma." },
    { href: "/admin/solicitudes", title: "Solicitudes", detail: `${solicitudes} pendientes de contacto`, text: "Consulta las solicitudes de suscripción y habilita los accesos acordados." },
    { href: "/admin/organizaciones", title: "Organizaciones y roles", detail: "Estructura institucional", text: "Organiza unidades educativas, distritos y responsables." },
    { href: "/admin/avisos", title: "Avisos del sistema", detail: `${avisos} pendientes de envío`, text: "Revisa el estado del correo y reintenta los avisos pendientes." },
  ].map(item => <Link key={item.href} href={item.href} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-viria-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-viria-600"><p className="text-sm font-medium text-viria-700">{item.detail}</p><h2 className="mt-3 text-xl font-semibold">{item.title}</h2><p className="mt-2 text-sm text-slate-500">{item.text}</p><span className="mt-5 block text-sm font-semibold text-viria-700">Abrir sección →</span></Link>)}</div></>
}
