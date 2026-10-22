import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/apiAuth"
import { institutionFor } from "@/lib/institution"
import { prisma } from "@/lib/prisma"
import { InstitutionUserForm, InstitutionAccountToggle } from "@/components/institucion/InstitutionForms"

export default async function InstitutionPage() {
 const auth = await getAuthContext(); if (!auth) redirect("/login")
 const member = await institutionFor(auth.userId); if (!member) redirect("/dashboard")
 const plan = member.institucion
 const members = member.gestor ? await prisma.institucionMiembro.findMany({ where: { institucionId: plan.id }, orderBy: { createdAt: "asc" } }) : []
 const users = members.length ? await prisma.usuario.findMany({ where: { id: { in: members.map(m => m.usuarioId) } }, select: { id: true, nombre: true, email: true, activo: true } }) : []
 return <main className="mx-auto max-w-5xl space-y-6 p-5 lg:p-8"><header><p className="text-sm text-viria-700">Paquete institucional</p><h1 className="mt-2 text-3xl font-semibold">{plan.nombre}</h1><p className="mt-3 text-slate-600">Un equipo, un cupo compartido. Cada cuenta trabaja con sus propios alumnos y resultados.</p></header>
 <section className="grid gap-4 sm:grid-cols-3">{[["Evaluaciones disponibles", `${plan.limiteEvaluaciones - plan.evaluacionesUsadas} de ${plan.limiteEvaluaciones}`],["Mis evaluaciones utilizadas",member.evaluacionesUsadas],["Cuentas asignadas",`${plan.usuariosUsados} de ${plan.limiteUsuarios}`]].map(([label,value]) => <div key={label} className="rounded-xl border bg-white p-5"><h2 className="text-sm text-slate-600">{label}</h2><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</section>
 <div className="rounded-xl border bg-viria-50 p-5 text-sm">El cupo se descuenta al guardar una evaluación nueva, incluso si está incompleta. Editar, consultar e imprimir no consume otra evaluación. Eliminar no devuelve el cupo. Al agotarlo se conservan los registros y su edición. Las 15 evaluaciones pertenecen a toda la institución, no a cada cuenta.</div>
 {member.gestor && <><section><h2 className="mb-4 text-xl font-semibold">Administrar el equipo</h2><p className="mb-4 text-sm text-slate-600">El responsable está incluido en las 10 cuentas. Desactivar cierra sus sesiones y conserva su plaza y registros; puedes reactivarla. Para cambiar de responsable o ampliar el paquete, contacta a fcalderon@vir-ia.com.</p><div className="space-y-3">{members.map(m => { const u = users.find(u => u.id === m.usuarioId); if (!u) return null; return <article key={u.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-4"><div className="min-w-0"><h3 className="font-semibold">{u.nombre}{m.gestor ? " · Responsable" : ""}</h3><p className="break-all text-sm text-slate-600">{u.email}</p><p className="mt-1 text-sm">{u.activo ? "Activa" : "Desactivada"} · {m.evaluacionesUsadas} evaluaciones utilizadas</p></div>{!m.gestor && <InstitutionAccountToggle usuarioId={u.id} activo={u.activo}/>}</article> })}</div></section>{plan.usuariosUsados < plan.limiteUsuarios && <InstitutionUserForm/>}</>}
 </main>
}
