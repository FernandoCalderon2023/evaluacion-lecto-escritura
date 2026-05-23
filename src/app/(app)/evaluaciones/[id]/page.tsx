export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calcularScores } from "@/lib/scoring"
import { EstadoBadge } from "@/components/resultados/EstadoAprendizaje"
import dynamicImport from "next/dynamic"
import { InformeIA } from "@/components/resultados/InformeIA"

// Lazy-load recharts (~50KB) — solo cargar cuando se ve la página de resultados
const GraficoRadar = dynamicImport(
  () => import("@/components/resultados/GraficoRadar").then(m => ({ default: m.GraficoRadar })),
  {
    ssr: false,
    loading: () => <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">Cargando gráfico...</div>,
  }
)
import { AnalisisIA } from "@/types/ai"
import { EstadoAprendizaje } from "@/types/evaluacion"
import { PrintButton } from "@/components/resultados/PrintButton"
import { DeleteButton } from "@/components/shared/DeleteButton"

const AREA_COLOR = {
  "Lectura y Comprensión": "bg-viria-500",
  "Procesos Cognitivos": "bg-purple-500",
  "Procesos Léxicos": "bg-indigo-500",
  "Escritura (Dictado)": "bg-orange-500",
  "Escritura (Composición)": "bg-rose-500",
}

export default async function EvaluacionResultadoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === "ADMIN"
  const docenteId = (session?.user as any)?.id

  const ev = await prisma.evaluacion.findUnique({
    where: { id: params.id },
    include: { estudiante: true },
  })
  if (!ev) notFound()
  if (!isAdmin && ev.docenteId !== docenteId) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scores = calcularScores(ev as any)
  const analisis = ev.analisisIA ? (JSON.parse(ev.analisisIA) as AnalisisIA) : null
  const est = ev.estudiante

  const edad = Math.floor(
    (Date.now() - new Date(est.fechaNac).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )

  return (
    <div className="p-4 lg:p-6 space-y-6 w-full">
      {/* Header (oculto al imprimir) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/evaluaciones" className="text-slate-500 hover:text-slate-700 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 font-mono truncate">{est.codigo ?? "—"}</h1>
            <p className="text-sm text-slate-500 truncate">
              {est.grado} · {est.unidadEducativa} · {edad} años
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <DeleteButton
            endpoint={`/api/evaluaciones/${ev.id}`}
            redirectTo={`/estudiantes/${est.id}`}
            label="Eliminar"
            confirmMessage="¿Eliminar esta evaluación? No se puede deshacer."
          />
          <Link
            href={`/evaluaciones/${ev.id}/editar`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Editar
          </Link>
          <PrintButton />
          <Link
            href={`/evaluaciones/nueva?estudianteId=${est.id}`}
            className="text-sm bg-viria-600 text-white px-3 py-2 rounded-lg hover:bg-viria-700"
          >
            Nueva
          </Link>
        </div>
      </div>

      {/* === ENCABEZADO PROFESIONAL DEL INFORME (solo print) === */}
      <div className="hidden print:block">
        <div className="border-b-2 border-slate-800 pb-3 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[8pt] uppercase tracking-widest text-slate-500 mb-1">SIDEDA · Sistema de Evaluación de Dificultades de Aprendizaje</p>
              <h1 className="text-[20pt] font-bold text-slate-900 leading-tight m-0">Informe Psicopedagógico</h1>
              <p className="text-[10pt] text-slate-600 mt-1">Instrumento MINEDU 2012{scores.bpm.applied ? " + Batería Psicomotora Da Fonseca" : ""} · R.M. 1040/2022</p>
            </div>
            <div className="text-right text-[8pt] text-slate-500">
              <p>Bolivia · {new Date().getFullYear()}</p>
              <p className="font-mono mt-0.5">{est.codigo ?? "—"}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-[9.5pt]">
            <div><span className="text-slate-500">Código:</span> <strong className="font-mono">{est.codigo ?? "—"}</strong></div>
            <div><span className="text-slate-500">Sexo:</span> <strong>{est.sexo}</strong></div>
            <div><span className="text-slate-500">Edad:</span> <strong>{edad} años</strong></div>
            <div><span className="text-slate-500">Grado:</span> <strong>{est.grado}</strong></div>
            <div><span className="text-slate-500">U. Educativa:</span> <strong>{est.unidadEducativa}</strong></div>
            <div><span className="text-slate-500">Fecha:</span> <strong>{new Date(ev.fecha).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })}</strong></div>
            <div className="col-span-3"><span className="text-slate-500">Evaluador/a:</span> <strong>{ev.evaluador}</strong></div>
          </div>
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
                const color = score <= 1.5 ? "bg-red-50 border-red-200" : score <= 2.5 ? "bg-yellow-50 border-yellow-200" : score <= 3.5 ? "bg-viria-50 border-viria-200" : "bg-green-50 border-green-200"
                return (
                  <div key={label} className={`rounded-lg p-3 border ${color}`}>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="font-bold text-lg">{score > 0 ? score.toFixed(1) : "—"}<span className="text-xs font-normal text-slate-400">/4</span></p>
                    <p className="text-xs text-slate-500 capitalize">{perfil}</p>
                  </div>
                )
              })}
              <div className={`rounded-lg p-3 border ${scores.bpm.promedioGeneral <= 1.5 ? "bg-red-100 border-red-300" : scores.bpm.promedioGeneral <= 2.5 ? "bg-yellow-100 border-yellow-300" : scores.bpm.promedioGeneral <= 3.5 ? "bg-viria-100 border-blue-300" : "bg-green-100 border-green-300"}`}>
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
              Podal: {scores.bpm.lateralidad.podal ?? "—"},
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
