export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getAuthContext, canViewInScope } from "@/lib/apiAuth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ArrowLeft } from "lucide-react"
import { DeleteButton } from "@/components/shared/DeleteButton"
import { PortfolioEvolucion } from "@/components/resultados/PortfolioEvolucion"

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  "sin-dificultades": { label: "Sin dificultades", color: "bg-green-100 text-green-800" },
  "dificultad-leve": { label: "Dificultad leve", color: "bg-yellow-100 text-yellow-800" },
  "dificultad-moderada": { label: "Dificultad moderada", color: "bg-orange-100 text-orange-800" },
  "dificultad-severa": { label: "Dificultad severa", color: "bg-red-100 text-red-800" },
}
const PRIORIDAD_COLOR: Record<string, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-amber-100 text-amber-700",
  baja: "bg-slate-100 text-slate-600",
}

export default async function PortafolioEstudiantePage({ params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth) redirect("/login")

  const est = await prisma.estudiante.findUnique({
    where: { id: params.id },
    include: { evaluaciones: { orderBy: { fecha: "desc" } } },
  })
  if (!est) notFound()
  // Acceso: dueño, admin, o director de la U.E. del estudiante
  if (!(await canViewInScope(auth, est))) notFound()

  const edad = Math.floor((Date.now() - new Date(est.fechaNac).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  const evals = est.evaluaciones
  const ultima = evals[0] ?? null
  const cfgUltima = ultima ? ESTADO_CONFIG[ultima.estadoAprendizaje ?? ""] : null

  // Perfil consolidado: última evaluación que tenga análisis IA
  const ultimaConIA = evals.find((e) => e.analisisIA)
  let analisis: any = null
  if (ultimaConIA?.analisisIA) {
    try { analisis = JSON.parse(ultimaConIA.analisisIA) } catch { analisis = null }
  }

  // Serie de evolución (orden cronológico ascendente)
  const evolucion = [...evals].reverse().map((e) => ({
    fecha: new Date(e.fecha).toLocaleDateString("es-BO", { month: "short", year: "2-digit" }),
    cognitivo: e.scoreCognitivo,
    lexical: e.scoreLexical,
    comprension: e.scoreComprension,
  }))

  const fortalezas: string[] = Array.isArray(analisis?.fortalezas) ? analisis.fortalezas : []
  const areas: any[] = Array.isArray(analisis?.areasDeMejora) ? analisis.areasDeMejora : []
  const recAula: any[] = Array.isArray(analisis?.recomendaciones?.paraElAula) ? analisis.recomendaciones.paraElAula : []
  const recFamilia: any[] = Array.isArray(analisis?.recomendaciones?.paraLaFamilia) ? analisis.recomendaciones.paraLaFamilia : []
  const plan = analisis?.planSeguimiento ?? null

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/estudiantes" className="text-slate-500 hover:text-slate-700 mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs uppercase tracking-wide text-viria-600 font-semibold">Portafolio del estudiante</p>
            <h1 className="text-2xl font-bold text-slate-900 font-mono">{est.codigo ?? "—"}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{est.apellido1} {est.apellido2} {est.nombre}</p>
            <p className="text-slate-500 text-sm mt-1">{est.grado} · {est.unidadEducativa} · {edad} años</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/evaluaciones/nueva?estudianteId=${est.id}`}
            className="flex items-center gap-1 bg-viria-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-viria-700"
          >
            <Plus className="h-4 w-4" /> Nueva evaluación
          </Link>
          <DeleteButton
            endpoint={`/api/estudiantes/${est.id}`}
            redirectTo="/estudiantes"
            label="Eliminar"
            confirmMessage={`¿Eliminar al estudiante ${est.codigo} y todas sus evaluaciones?`}
          />
        </div>
      </div>

      {/* Estado actual */}
      <Card>
        <CardHeader><CardTitle className="text-base">Estado actual</CardTitle></CardHeader>
        <CardContent>
          {ultima ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {cfgUltima && (
                  <span className={`text-sm px-3 py-1 rounded-full font-semibold ${cfgUltima.color}`}>{cfgUltima.label}</span>
                )}
                <span className="text-sm text-slate-500">
                  Última evaluación: {new Date(ultima.fecha).toLocaleDateString("es-BO")} · {evals.length} en total
                </span>
              </div>
              {analisis?.perfilDAE?.resumen && (
                <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">{analisis.perfilDAE.resumen}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Este estudiante aún no tiene evaluaciones. Registrá la primera para empezar su portafolio.</p>
          )}
        </CardContent>
      </Card>

      {/* Evolución + Datos personales */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Evolución de puntajes</CardTitle></CardHeader>
          <CardContent>
            <PortfolioEvolucion data={evolucion} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Datos personales</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="text-slate-500">Sexo:</span> {est.sexo === "M" ? "Masculino" : "Femenino"}</div>
            <div><span className="text-slate-500">Edad:</span> {edad} años</div>
            <div><span className="text-slate-500">Grado:</span> {est.grado}</div>
            <div><span className="text-slate-500">Gestión:</span> {est.gestion}</div>
            <div><span className="text-slate-500">Docente:</span> {est.docente}</div>
            {est.codigoRude && <div><span className="text-slate-500">RUDE:</span> {est.codigoRude}</div>}
            {est.domicilio && <div><span className="text-slate-500">Domicilio:</span> {est.domicilio}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Perfil consolidado (última evaluación con IA) */}
      {analisis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Perfil consolidado
              {ultimaConIA && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  según evaluación del {new Date(ultimaConIA.fecha).toLocaleDateString("es-BO")}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {fortalezas.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-2">Fortalezas</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                  {fortalezas.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            )}

            {areas.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Áreas en construcción</h3>
                <div className="space-y-2">
                  {areas.map((a, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-800">{a.area}</span>
                        {a.prioridad && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${PRIORIDAD_COLOR[a.prioridad] ?? "bg-slate-100 text-slate-600"}`}>
                            prioridad {a.prioridad}
                          </span>
                        )}
                      </div>
                      {a.descripcion && <p className="text-xs text-slate-600">{a.descripcion}</p>}
                      {a.brechaConCurriculo && <p className="text-xs text-slate-500 mt-1 italic">{a.brechaConCurriculo}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {recAula.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-viria-700 mb-2">Recomendaciones para el aula</h3>
                  <ul className="space-y-2 text-sm">
                    {recAula.map((r, i) => (
                      <li key={i} className="text-slate-700">
                        <span className="font-medium">{r.titulo}</span>
                        {r.descripcion && <span className="text-slate-600"> — {r.descripcion}</span>}
                        {r.frecuencia && <span className="block text-xs text-slate-400">{r.frecuencia}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recFamilia.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-amber-700 mb-2">Sugerencias para la familia</h3>
                  <ul className="space-y-2 text-sm">
                    {recFamilia.map((r, i) => (
                      <li key={i} className="text-slate-700">
                        <span className="font-medium">{r.titulo}</span>
                        {r.descripcion && <span className="text-slate-600"> — {r.descripcion}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {plan && (
              <div className="pt-2 border-t border-slate-100 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Plan de seguimiento:</span>{" "}
                revaluación en {plan.periodoRevaluacion}.
                {Array.isArray(plan.indicadoresProgreso) && plan.indicadoresProgreso.length > 0 && (
                  <ul className="list-disc pl-5 mt-1">
                    {plan.indicadoresProgreso.map((ind: string, i: number) => <li key={i}>{ind}</li>)}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Línea de tiempo de evaluaciones */}
      <Card>
        <CardHeader><CardTitle className="text-base">Historial de evaluaciones ({evals.length})</CardTitle></CardHeader>
        <CardContent>
          {evals.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Sin evaluaciones registradas</p>
          ) : (
            <div className="space-y-2">
              {evals.map((ev) => {
                const cfg = ESTADO_CONFIG[ev.estadoAprendizaje ?? ""]
                return (
                  <Link key={ev.id} href={`/evaluaciones/${ev.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{new Date(ev.fecha).toLocaleDateString("es-BO")}</p>
                        <p className="text-xs text-slate-500">{ev.evaluador}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          {ev.scoreCognitivo != null && <span>Cog {ev.scoreCognitivo}/27</span>}
                          {ev.scoreLexical != null && <span>Léx {ev.scoreLexical}/17</span>}
                        </span>
                        {cfg && <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>}
                      </div>
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
