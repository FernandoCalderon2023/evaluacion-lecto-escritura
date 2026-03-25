"use client"
import { useState } from "react"
import { AnalisisIA } from "@/types/ai"
import { useToast } from "@/hooks/use-toast"
import { Sparkles, CheckCircle, AlertTriangle, Users, BookOpen, Calendar, GraduationCap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  evaluacionId: string
  analisisInicial: AnalisisIA | null
  analisisGeneradoEn: Date | null
}

const PRIORIDAD_COLOR = {
  alta:  "bg-red-100 text-red-700 border-red-200",
  media: "bg-yellow-100 text-yellow-700 border-yellow-200",
  baja:  "bg-green-100 text-green-700 border-green-200",
}

export function InformeIA({ evaluacionId, analisisInicial, analisisGeneradoEn }: Props) {
  const { toast } = useToast()
  const [analisis, setAnalisis] = useState<AnalisisIA | null>(analisisInicial)
  const [generadoEn, setGeneradoEn] = useState<Date | null>(analisisGeneradoEn)
  const [loading, setLoading] = useState(false)

  async function generarAnalisis() {
    setLoading(true)
    try {
      const res = await fetch(`/api/evaluaciones/${evaluacionId}/analisis`, { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAnalisis(data.analisis)
      setGeneradoEn(new Date())
      toast({ title: "Análisis generado correctamente" })
    } catch {
      toast({ title: "Error al generar el análisis", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!analisis ? (
        <div className="text-center py-10 space-y-3 border-2 border-dashed border-slate-200 rounded-xl">
          <Sparkles className="h-10 w-10 text-blue-400 mx-auto" />
          <div>
            <p className="font-semibold text-slate-700">Análisis con Inteligencia Artificial</p>
            <p className="text-sm text-slate-500 mt-1">
              Claude analizará los resultados y generará diagnóstico, fortalezas y recomendaciones personalizadas
            </p>
          </div>
          <button
            onClick={generarAnalisis}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Generando análisis..." : "Generar Análisis IA"}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Análisis generado por Claude AI</span>
              {generadoEn && (
                <span className="text-xs">· {new Date(generadoEn).toLocaleDateString("es-BO")}</span>
              )}
            </div>
            <button
              onClick={generarAnalisis}
              disabled={loading}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50"
            >
              {loading ? "Regenerando..." : "Regenerar"}
            </button>
          </div>

          {/* Diagnóstico */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-600 font-medium">Diagnóstico General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-800 leading-relaxed">{analisis.diagnostico.resumen}</p>
              {analisis.diagnostico.relacionEdadGrado && (
                <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
                  <GraduationCap className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800">{analisis.diagnostico.relacionEdadGrado}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fortalezas */}
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" /> Fortalezas identificadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {analisis.fortalezas.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Áreas de mejora */}
          {analisis.areasDeMejora.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="h-4 w-4" /> Áreas de mejora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analisis.areasDeMejora.map((a, i) => (
                    <div key={i} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-800">{a.area}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORIDAD_COLOR[a.prioridad]}`}>
                          Prioridad {a.prioridad}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{a.descripcion}</p>
                      {a.brechaConCurriculo && (
                        <div className="mt-2 bg-orange-50 border border-orange-200 rounded p-2">
                          <p className="text-xs text-orange-700">
                            <span className="font-semibold">Brecha con currículo R.M. 1040/2022: </span>
                            {a.brechaConCurriculo}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recomendaciones docente */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                <BookOpen className="h-4 w-4" /> Recomendaciones para el docente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analisis.recomendaciones.paraElDocente.map((r, i) => (
                  <div key={i} className="border-l-2 border-blue-400 pl-3">
                    <p className="text-sm font-medium text-slate-800">{r.titulo}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{r.descripcion}</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">{r.frecuencia}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones familia */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-700">
                <Users className="h-4 w-4" /> Recomendaciones para la familia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analisis.recomendaciones.paraLaFamilia.map((r, i) => (
                  <div key={i} className="border-l-2 border-purple-300 pl-3">
                    <p className="text-sm font-medium text-slate-800">{r.titulo}</p>
                    <p className="text-xs text-slate-600">{r.descripcion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Derivación */}
          {analisis.recomendaciones.derivacion.necesaria && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Se recomienda derivación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-800 font-medium">
                  Especialista: {analisis.recomendaciones.derivacion.especialista}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {analisis.recomendaciones.derivacion.justificacion}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Plan de seguimiento */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-slate-700">
                <Calendar className="h-4 w-4" /> Plan de seguimiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-slate-700 mb-2">
                Re-evaluación en: {analisis.planSeguimiento.periodoRevaluacion}
              </p>
              <ul className="space-y-1">
                {analisis.planSeguimiento.indicadoresProgreso.map((ind, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-600">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {ind}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
