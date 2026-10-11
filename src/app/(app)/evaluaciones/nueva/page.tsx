import { trialAccess } from "@/lib/commercial"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getAuthContext, ownerScope } from "@/lib/apiAuth"
import { EvaluacionWizard } from "@/components/evaluacion/EvaluacionWizard"
import Link from "next/link"
export const dynamic = "force-dynamic"

export default async function NuevaEvaluacionPage({ searchParams }: { searchParams: Promise<{ estudianteId?: string; q?: string; pagina?: string }> }) {
  const params = await searchParams
  const auth = await getAuthContext()
  if (!auth) redirect("/login")
  if (auth.role === "FAMILIA") redirect("/familia")
  const access = await trialAccess(auth.userId)
  if (access?.estado === "PRUEBA" && access.evaluacionesUsadas >= 1) redirect("/suscripcion")
  const owner = ownerScope(auth)
  if (!params.estudianteId) {
    const q = (params.q ?? "").slice(0, 100)
    const where = { ...owner, ...(q ? { OR: [{ nombre: { contains: q } }, { apellido1: { contains: q } }, { codigo: { contains: q } }] } : {}) }
    const total = await prisma.estudiante.count({ where })
    const pages = Math.max(1, Math.ceil(total / 24))
    const requested = Number(params.pagina)
    const page = Math.min(pages, Number.isSafeInteger(requested) && requested > 0 ? requested : 1)
    const students = await prisma.estudiante.findMany({ where, orderBy: [{ codigo: "asc" }, { id: "asc" }], skip: (page - 1) * 24, take: 24, select: { id: true, nombre: true, apellido1: true, codigo: true, grado: true, unidadEducativa: true } })
    const pageHref = (pagina: number) => `/evaluaciones/nueva?${new URLSearchParams({ q, pagina: String(pagina) })}`
    return <div className="mx-auto max-w-5xl space-y-5 p-4 lg:p-8">
      <Link className="text-sm text-viria-700" href="/evaluaciones">← Mis evaluaciones</Link>
      <div><p className="text-xs font-semibold uppercase tracking-wide text-viria-700">Antes de empezar</p><h1 className="mt-2 text-2xl font-bold">¿A qué estudiante vas a evaluar?</h1><p className="mt-3 text-sm text-slate-600">Selecciona al alumno para abrir su registro y las indicaciones de aplicación. Aquí aparecen únicamente los estudiantes que puedes gestionar.</p></div>
      <form className="flex gap-2"><input aria-label="Buscar alumno para evaluar" name="q" defaultValue={q} maxLength={100} placeholder="Nombre, apellido o código" className="min-w-0 flex-1 rounded-xl border p-3"/><button className="rounded-xl bg-viria-900 px-4 text-white">Buscar</button></form>
      <div className="grid gap-3 sm:grid-cols-2">{students.map(student => <Link key={student.id} href={`/evaluaciones/nueva?estudianteId=${student.id}`} className="rounded-xl border bg-white p-4 hover:border-viria-600"><h2 className="font-semibold break-words">{student.nombre} {student.apellido1}</h2><p className="mt-1 text-sm text-slate-500">{student.codigo} · {student.grado} · {student.unidadEducativa}</p><p className="mt-3 text-sm font-semibold text-viria-700">Preparar evaluación →</p></Link>)}</div>
      {!students.length && <p className="rounded-xl border bg-white p-5 text-sm">{q ? "No hay alumnos que coincidan con la búsqueda. Prueba otro nombre o código." : "Primero debes registrar al menos un estudiante."}</p>}
      {pages > 1 && <nav aria-label="Páginas de alumnos" className="flex items-center justify-between gap-3 text-sm">{page > 1 ? <Link href={pageHref(page - 1)}>Anterior</Link> : <span/>}<span>{page} de {pages}</span>{page < pages ? <Link href={pageHref(page + 1)}>Siguiente</Link> : <span/>}</nav>}
      <Link className="inline-flex min-h-12 items-center rounded-xl border bg-white px-4 text-sm font-semibold text-viria-700" href="/estudiantes/nuevo">Registrar un nuevo estudiante</Link>
      <p className="text-xs text-slate-500">¿Ya comenzaste? Puedes retomar una evaluación guardada desde <Link href="/evaluaciones?estado=evaluacion-incompleta" className="underline">evaluaciones pendientes</Link>. Abrir este asistente no consume una evaluación de prueba; se utiliza al guardar.</p>
    </div>
  }
  const student = await prisma.estudiante.findFirst({ where: { ...owner, id: params.estudianteId }, select: { id: true, nombre: true, apellido1: true, codigo: true, grado: true } })
  if (!student) notFound()
  const person = await prisma.usuario.findUnique({ where: { id: auth.userId }, select: { nombre: true } })
  return <div className="max-w-7xl space-y-5 p-4 lg:p-8">
    <Link href="/evaluaciones/nueva" className="text-sm font-semibold text-viria-700">← Elegir otro estudiante</Link>
    <div><h1 className="text-2xl font-bold text-slate-900">Nueva evaluación</h1><p className="mt-2 break-words text-slate-700">{student.nombre} {student.apellido1} · {student.codigo} · {student.grado}</p><p className="mt-2 text-sm text-slate-500">Confirma los datos, sigue las indicaciones y guarda lo observado. Lo que no apliques debe quedar pendiente.</p></div>
    <div className="rounded-xl border bg-white p-3 sm:p-6"><EvaluacionWizard key={student.id} draftOwner={auth.userId} estudianteId={student.id} estudiantes={[student]} evaluatorName={person?.nombre ?? ""}/></div>
  </div>
}
