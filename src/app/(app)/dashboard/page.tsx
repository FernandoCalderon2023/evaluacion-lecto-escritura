import { classificationSelect } from "@/lib/classificationSelect"
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getAuthContext, resolveScope } from "@/lib/apiAuth"
import { redirect } from "next/navigation"
import { calcularScores } from "@/lib/scoring"
import { summarizeStudents } from "@/lib/dashboardSummary"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, ArrowRight } from "lucide-react"
import Link from "next/link"

async function getDashboardData(filtro: any, individual: any) {
  const [students, totalEv, recientes] = await Promise.all([
    prisma.estudiante.findMany({
      where: filtro,
      select: { evaluaciones: { select: classificationSelect, where: filtro, orderBy: [{ fecha: "desc" }, { createdAt: "desc" }, { id: "desc" }], take: 1 } },
    }),
    prisma.evaluacion.count({ where: { AND: [filtro, { estudiante: filtro }] } }),
    prisma.evaluacion.findMany({
      where: { AND: [individual, { estudiante: individual }] }, take: 6, orderBy: { fecha: "desc" },
      select: { ...classificationSelect, id: true, fecha: true, estudiante: { select: { codigo: true, grado: true } } },
    }),
  ])
  return { totalEst: students.length, totalEv, estadoMap: summarizeStudents(students as any), recientes }
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
  const { totalEst, totalEv, estadoMap, recientes } = await getDashboardData(scope, individual)
  const assignments = auth.isAdmin ? [] : await prisma.membership.findMany({ where: { usuarioId: auth.userId, rol: { in: ["DIRECTOR", "DISTRITAL", "DEPARTAMENTAL"] } }, select: { rol: true, organizacion: { select: { nombre: true } } } })
  const institutional = assignments.length > 0
  const aggregateOnly = assignments.some(m => m.rol === "DISTRITAL" || m.rol === "DEPARTAMENTAL")
  const pending = estadoMap["evaluacion-incompleta"] ?? 0
  const nextHref = institutional ? "/estudiantes" : totalEst === 0 ? "/estudiantes/nuevo" : pending ? "/evaluaciones?estado=evaluacion-incompleta" : "/evaluaciones/nueva"
  const nextLabel = institutional ? "Consultar estudiantes" : totalEst === 0 ? "Registrar estudiante" : pending ? "Continuar evaluaciones pendientes" : "Nueva evaluación"

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-viria-700">SIDEDA / Tu espacio de trabajo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{institutional ? "Resumen institucional" : totalEst === 0 ? "Empecemos con el primer estudiante." : "Tu resumen de evaluaciones"}</h1>
          <p className="mt-3 text-sm text-slate-500">{institutional ? "Consulta el avance de las organizaciones asignadas y de tus propios registros." : "Revisa lo pendiente y consulta los resultados más recientes."}</p>
          {institutional && <p className="mt-2 text-sm font-medium text-viria-700">{assignments.map(m => m.organizacion.nombre).join(" · ")}</p>}
        </div>
        <Link href={nextHref} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-viria-900 px-5 py-3 text-sm font-semibold text-white hover:bg-viria-800"><ArrowRight size={17}/>{nextLabel}</Link>
      </div>

      {!institutional && totalEv === 0 && <section aria-label="Primeros pasos" className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Cómo empezar</h2><p className="mt-2 text-sm text-slate-600">Registra al estudiante, aplica los ejercicios y guarda lo observado. Después podrás revisar los resultados.</p><Link href="/guia" className="mt-3 inline-block text-sm font-semibold text-viria-700">Consultar la guía de uso →</Link></section>}
      {institutional && <p className="rounded-xl border border-viria-200 bg-viria-50 p-4 text-sm text-viria-900">Los indicadores respetan tus asignaciones institucionales. {aggregateOnly ? "Los totales pueden incluir organizaciones cuyos expedientes individuales no están disponibles para tu cuenta." : "Puedes consultar los expedientes de tus unidades educativas; editar y eliminar corresponde a su responsable o al administrador."}</p>}
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
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
          <CardTitle className="text-base">{aggregateOnly ? "Tus evaluaciones recientes" : "Evaluaciones recientes"}</CardTitle>
          <Link href="/evaluaciones" className="text-sm text-viria-600 hover:underline">
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          {recientes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              {institutional ? "No hay evaluaciones disponibles para consulta en este ámbito." : "Aquí aparecerán las evaluaciones que guardes."}
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
