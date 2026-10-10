export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getAuthContext, resolveScope } from "@/lib/apiAuth"
import { redirect } from "next/navigation"
import { calcularScores } from "@/lib/scoring"
import { summarizeStudents } from "@/lib/dashboardSummary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, AlertTriangle, CheckCircle, ArrowRight, BookOpen, FileText, Plus } from "lucide-react"
import Link from "next/link"

async function getDashboardData(filtro: any, individual: any) {
  const [students, totalEv, recientes, reports] = await Promise.all([
    prisma.estudiante.findMany({
      where: filtro,
      select: { evaluaciones: { where: filtro, orderBy: [{ fecha: "desc" }, { createdAt: "desc" }, { id: "desc" }], take: 1 } },
    }),
    prisma.evaluacion.count({ where: { AND: [filtro, { estudiante: filtro }] } }),
    prisma.evaluacion.findMany({
      where: { AND: [individual, { estudiante: individual }] }, take: 6, orderBy: { fecha: "desc" },
      include: { estudiante: { select: { codigo: true, grado: true } } },
    }),
    prisma.evaluacion.count({ where: { AND: [filtro, { estudiante: filtro }, { analisisIA: { not: null } }] } }),
  ])
  return { totalEst: students.length, totalEv, estadoMap: summarizeStudents(students as any), recientes, reports }
}

const ESTADO_CONFIG = {
  "evaluacion-incompleta": { label: "Evaluación incompleta", color: "bg-slate-100 text-slate-700" },
  "sin-dificultades":    { label: "Sin Dificultades",    color: "bg-green-100 text-green-800" },
  "dificultad-leve":     { label: "Dificultad Leve",     color: "bg-yellow-100 text-yellow-800" },
  "dificultad-moderada": { label: "Dificultad Moderada", color: "bg-orange-100 text-orange-800" },
  "dificultad-severa":   { label: "Dificultad Severa",   color: "bg-red-100 text-red-800" },
}

export default async function DashboardPage() {
  const auth = await getAuthContext()
  if (!auth) redirect("/login")
  const scope = await resolveScope(auth, "aggregate")

  const individual = await resolveScope(auth, "individual")
  const { totalEst, totalEv, estadoMap, recientes, reports } = await getDashboardData(scope, individual)

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-viria-700">SIDEDA / Tu espacio de trabajo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{totalEst === 0 ? "Empecemos con el primer estudiante." : "Cada avance, en un mismo lugar."}</h1>
          <p className="mt-3 text-sm text-slate-500">Organiza las evaluaciones y encuentra el siguiente paso para acompañar el aprendizaje.</p>
        </div>
        <Link href={totalEst === 0 ? "/estudiantes/nuevo" : "/evaluaciones/nueva"} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-viria-900 px-5 py-3 text-sm font-semibold text-white hover:bg-viria-800"><Plus size={17}/>{totalEst === 0 ? "Registrar estudiante" : "Nueva evaluación"}</Link>
      </div>

      <section aria-label="Primeros pasos" className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold text-slate-800">Tu recorrido en SIDEDA</h2><Link href="/guia" className="inline-flex items-center gap-2 text-xs font-semibold text-viria-700"><BookOpen size={15}/>Guía de uso</Link></div>
        <div className="grid gap-3 md:grid-cols-3">{[
          { icon: Users, title: "1. Registrar", text: "Crea el portafolio del estudiante.", done: totalEst > 0, href: "/estudiantes/nuevo" },
          { icon: ClipboardList, title: "2. Evaluar", text: "Registra las observaciones aplicadas.", done: totalEv > 0, href: "/evaluaciones/nueva" },
          { icon: FileText, title: "3. Revisar el informe", text: "Genera y revisa la orientación con IA.", done: reports > 0, href: "/evaluaciones" },
        ].map(({icon: Icon,title,text,done,href})=><Link key={title} href={href} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-viria-300 hover:bg-viria-50/40"><div className={`rounded-lg p-2 ${done ? "bg-viria-50 text-viria-700" : "bg-slate-100 text-slate-500"}`}>{done ? <CheckCircle size={19}/> : <Icon size={19}/>}</div><div className="flex-1"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p><span className="mt-2 inline-block text-[11px] font-medium text-viria-700">{done ? "Ya comenzaste" : "Empezar"}</span></div><ArrowRight size={15} className="mt-2 text-slate-400"/></Link>)}</div>
      </section>
      {(estadoMap["evaluacion-incompleta"] ?? 0) > 0 && <Link href="/evaluaciones?estado=evaluacion-incompleta" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"><span><strong>{estadoMap["evaluacion-incompleta"]}</strong> estudiante(s) con su última evaluación incompleta. Revisa los criterios pendientes.</span><span className="inline-flex items-center gap-2 font-semibold">Ver pendientes<ArrowRight size={16}/></span></Link>}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <Users className="h-4 w-4" /> Total Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalEst}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Total Evaluaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalEv}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" /> Sin Dificultades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {estadoMap["sin-dificultades"] ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Estudiantes con dificultad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {(estadoMap["dificultad-leve"] ?? 0) +
               (estadoMap["dificultad-moderada"] ?? 0) +
               (estadoMap["dificultad-severa"] ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por estado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estudiantes según su última evaluación</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">Cada estudiante se cuenta una sola vez. Sin evaluación: {estadoMap["sin-evaluar"] ?? 0}. Los registros incompletos no se incluyen entre los casos con dificultad.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
              <div key={key} className={`rounded-lg p-4 ${cfg.color}`}>
                <p className="text-2xl font-bold">{estadoMap[key] ?? 0}</p>
                <p className="text-xs mt-1">{cfg.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evaluaciones recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Evaluaciones Recientes</CardTitle>
          <Link href="/evaluaciones/nueva" className="text-sm text-viria-600 hover:underline">
            + Nueva evaluación
          </Link>
        </CardHeader>
        <CardContent>
          {recientes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No hay evaluaciones aún.{" "}
              <Link href="/evaluaciones/nueva" className="text-viria-600 hover:underline">
                Crear la primera
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {recientes.map((ev) => {
                const cfg = ESTADO_CONFIG[calcularScores(ev as any).estadoGeneral]
                return (
                  <Link key={ev.id} href={`/evaluaciones/${ev.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                      <div>
                        <p className="text-sm font-bold text-slate-900 font-mono">
                          {ev.estudiante.codigo ?? "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {ev.estudiante.grado} · {new Date(ev.fecha).toLocaleDateString("es-BO")}
                        </p>
                      </div>
                      {cfg && (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
