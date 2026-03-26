import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calcularScores } from "@/lib/scoring"
import { EstadoBadge } from "@/components/resultados/EstadoAprendizaje"
import { GraficoRadar } from "@/components/resultados/GraficoRadar"
import { InformeIA } from "@/components/resultados/InformeIA"
import { AnalisisIA } from "@/types/ai"
import { EstadoAprendizaje } from "@/types/evaluacion"
import { PrintButton } from "@/components/resultados/PrintButton"
import { DeleteButton } from "@/components/shared/DeleteButton"

const AREA_COLOR = {
  "Lectura y Comprensión": "bg-blue-500",
  "Procesos Cognitivos": "bg-purple-500",
  "Procesos Léxicos": "bg-indigo-500",
  "Escritura (Dictado)": "bg-orange-500",
  "Escritura (Composición)": "bg-rose-500",
}

export default async function EvaluacionResultadoPage({ params }: { params: { id: string } }) {
  const ev = await prisma.evaluacion.findUnique({
    where: { id: params.id },
    include: { estudiante: true },
  })
  if (!ev) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scores = calcularScores(ev as any)
  const analisis = ev.analisisIA ? (JSON.parse(ev.analisisIA) as AnalisisIA) : null
  const est = ev.estudiante

  const edad = Math.floor(
    (Date.now() - new Date(est.fechaNac).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/evaluaciones" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {est.apellido1} {est.apellido2} {est.nombre}
            </h1>
            <p className="text-sm text-slate-500">
              {est.grado} · {est.unidadEducativa} · {edad} años
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <DeleteButton
            endpoint={`/api/evaluaciones/${ev.id}`}
            redirectTo={`/estudiantes/${est.id}`}
            label="Eliminar"
            confirmMessage="¿Eliminar esta evaluación? No se puede deshacer."
          />
          <PrintButton />
          <Link
            href={`/evaluaciones/nueva?estudianteId=${est.id}`}
            className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
          >
            Nueva evaluación
          </Link>
        </div>
      </div>

      {/* Datos del informe (visible al imprimir) */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">Informe de Evaluación — Lecto-Escritura</h1>
        <p className="text-sm">Ministerio de Educación del Estado Plurinacional de Bolivia</p>
        <div className="grid grid-cols-3 gap-2 mt-3 text-sm border-t pt-3">
          <div><strong>Estudiante:</strong> {est.apellido1} {est.nombre}</div>
          <div><strong>Grado:</strong> {est.grado}</div>
          <div><strong>Fecha:</strong> {new Date(ev.fecha).toLocaleDateString("es-BO")}</div>
          <div><strong>Unidad Educativa:</strong> {est.unidadEducativa}</div>
          <div><strong>Evaluador:</strong> {ev.evaluador}</div>
          <div><strong>Edad:</strong> {edad} años</div>
        </div>
      </div>

      {/* Estado general */}
      <div className="flex items-center gap-4">
        <EstadoBadge estado={scores.estadoGeneral as EstadoAprendizaje} size="lg" />
        {scores.areasDificultad.length > 0 && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Áreas con dificultad: </span>
            {scores.areasDificultad.join(", ")}
          </div>
        )}
      </div>

      {/* Gráfica + scores cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Perfil de desempeño (% de logro)</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoRadar scores={scores} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {[
            { label: "Comprensión Lectora", val: scores.lectura.comprensionTotal, max: 15, diff: scores.lectura.hasDifficulty },
            { label: "Procesos Cognitivos", val: scores.cognitivo.totalCorrect, max: scores.cognitivo.totalItems, diff: scores.cognitivo.hasDifficulty },
            { label: "Procesos Léxicos", val: scores.lexical.totalCorrect, max: scores.lexical.totalItems, diff: scores.lexical.hasDifficulty },
            { label: "Escritura — Dictado", val: scores.dictado.positiveTotal, max: 34, diff: scores.dictado.hasDifficulty },
            { label: "Escritura — Composición", val: scores.composicion.positiveTotal, max: 34, diff: scores.composicion.hasDifficulty },
          ].map(({ label, val, max, diff }) => {
            const pct = Math.round((val / max) * 100)
            return (
              <div key={label} className="bg-white rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <span className={`text-xs font-bold ${diff ? "text-red-600" : "text-green-700"}`}>
                    {val}/{max}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${diff ? "bg-red-400" : "bg-green-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {pct}% — {diff ? "⚠️ Presenta dificultades" : "✅ Sin dificultades"}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Desglose detallado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Desglose por ejercicio (Ítems 3-10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            {Object.entries(scores.cognitivo.byItem).map(([key, val]) => {
              const max = { item3a: 3, item3b: 3, item4: 2, item5a: 3, item5b: 1, item6: 3, item7: 1, item8: 4, item9: 4, item10: 3 }[key] ?? 1
              const label = { item3a: "3A Nombrar", item3b: "3B Explicar", item4: "4 Instruc.", item5a: "5A Clasif.", item5b: "5B Día/Noche", item6: "6 Orientac.", item7: "7 Secuenc.", item8: "8 Asociac.", item9: "9 Anagram.", item10: "10 Inferen." }[key]
              return (
                <div key={key} className={`rounded-lg p-2 border ${val === max ? "bg-green-50 border-green-200" : val === 0 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-bold text-lg">{val}<span className="text-xs font-normal text-slate-400">/{max}</span></p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Desglose por ejercicio (Ítems 11-14 — Léxico)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            {Object.entries(scores.lexical.byItem).map(([key, val]) => {
              const max = { item11a: 4, item11b: 4, item12: 3, item13: 3, item14: 3 }[key] ?? 1
              const label = { item11a: "11A Produce rimas", item11b: "11B No rima", item12: "12 Sustitución", item13: "13 Omisión", item14: "14 Inversión" }[key]
              return (
                <div key={key} className={`rounded-lg p-2 border ${val === max ? "bg-green-50 border-green-200" : val === 0 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-bold text-lg">{val}<span className="text-xs font-normal text-slate-400">/{max}</span></p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Errores de lectura */}
      {scores.lectura.erroresPresentes.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-sm text-orange-700">Errores detectados en lectura oral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {scores.lectura.erroresPresentes.map((e) => (
                <span key={e} className="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full text-xs font-medium">
                  {e}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* BPM Results */}
      {scores.bpm.applied && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Perfil Psicomotor (BPM — Da Fonseca)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {[
                { label: "Tonicidad", score: scores.bpm.tonicidad.score, perfil: scores.bpm.tonicidad.perfil },
                { label: "Equilibrio", score: scores.bpm.equilibrio.score, perfil: scores.bpm.equilibrio.perfil },
                { label: "Lateralidad", score: scores.bpm.lateralidad.score, perfil: scores.bpm.lateralidad.perfil },
                { label: "Noción Cuerpo", score: scores.bpm.nocionCuerpo.score, perfil: scores.bpm.nocionCuerpo.perfil },
                { label: "Estr. E-T", score: scores.bpm.estructuracionET.score, perfil: scores.bpm.estructuracionET.perfil },
                { label: "Praxia Global", score: scores.bpm.praxiaGlobal.score, perfil: scores.bpm.praxiaGlobal.perfil },
                { label: "Praxia Fina", score: scores.bpm.praxiaFina.score, perfil: scores.bpm.praxiaFina.perfil },
              ].map(({ label, score, perfil }) => {
                const color = score <= 1.5 ? "bg-red-50 border-red-200" : score <= 2.5 ? "bg-yellow-50 border-yellow-200" : score <= 3.5 ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"
                return (
                  <div key={label} className={`rounded-lg p-3 border ${color}`}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="font-bold text-lg">{score > 0 ? score.toFixed(1) : "—"}<span className="text-xs font-normal text-slate-400">/4</span></p>
                    <p className="text-xs text-slate-500 capitalize">{perfil}</p>
                  </div>
                )
              })}
              <div className={`rounded-lg p-3 border ${scores.bpm.promedioGeneral <= 1.5 ? "bg-red-100 border-red-300" : scores.bpm.promedioGeneral <= 2.5 ? "bg-yellow-100 border-yellow-300" : scores.bpm.promedioGeneral <= 3.5 ? "bg-blue-100 border-blue-300" : "bg-green-100 border-green-300"}`}>
                <p className="text-xs text-slate-500 font-semibold">GENERAL</p>
                <p className="font-bold text-xl">{scores.bpm.promedioGeneral.toFixed(1)}<span className="text-xs font-normal text-slate-400">/4</span></p>
                <p className="text-xs font-semibold capitalize">{scores.bpm.perfilGeneral}</p>
              </div>
            </div>
            {/* Laterality detail */}
            <div className="mt-3 bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              <span className="font-semibold">Lateralidad: </span>
              {scores.bpm.lateralidad.tipo} ({scores.bpm.lateralidad.definida ? "definida" : "no definida"})
              {" — "}
              Ocular: {scores.bpm.lateralidad.ocular ?? "—"},
              Manual: {scores.bpm.lateralidad.manual ?? "—"},
              Pedal: {scores.bpm.lateralidad.pedal ?? "—"},
              Auditiva: {scores.bpm.lateralidad.auditiva ?? "—"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informe IA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Análisis e Informe con IA</CardTitle>
        </CardHeader>
        <CardContent>
          <InformeIA
            evaluacionId={ev.id}
            analisisInicial={analisis}
            analisisGeneradoEn={ev.analisisGeneradoEn}
          />
        </CardContent>
      </Card>
    </div>
  )
}
