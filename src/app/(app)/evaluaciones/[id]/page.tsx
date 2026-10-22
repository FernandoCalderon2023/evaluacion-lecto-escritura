import { ReportHistory } from "@/components/resultados/ReportHistory"
import { ReportTrace } from "@/components/resultados/ReportTrace"
import { readGuardedReport } from "@/lib/ai/reportGuard"
import { isTrial } from "@/lib/commercial"
import { TrialResult } from "@/components/resultados/TrialResult"
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getAuthContext, canViewInScope, canAccessResource } from "@/lib/apiAuth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calcularScores } from "@/lib/scoring"
import { EstadoBadge } from "@/components/resultados/EstadoAprendizaje"
import { InformeIA } from "@/components/resultados/InformeIA"
import { LazyRadar as GraficoRadar } from "@/components/resultados/LazyRadar"
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

export default async function EvaluacionResultadoPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await getAuthContext()
  if (!auth) redirect("/login")

  const ev = await prisma.evaluacion.findUnique({
    where: { id: params.id },
    include: { estudiante: true },
  })
  if (!ev) notFound()
  if (!(await canViewInScope(auth, { docenteId: ev.docenteId, unidadEducativaId: ev.estudiante?.unidadEducativaId ?? null }))) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canEdit = canAccessResource(auth, ev.docenteId)
  const canCreate = canAccessResource(auth, ev.estudiante.docenteId)
  const scores = calcularScores(ev as any)
  if (await isTrial(auth.userId)) return <><ReportTrace record={ev} scores={scores}/><ReportHistory id={ev.id}/><TrialResult id={ev.id} codigo={ev.estudiante.codigo} scores={scores} canEdit={canEdit}/></>
  const analisis = readGuardedReport(ev.analisisIA, calcularScores(ev as any))
  const est = ev.estudiante

  const edad = ev.edadAlEvaluar == null ? "Edad no registrada" : `${ev.edadAlEvaluar} años`

  return (
    <div className="p-4 lg:p-6 space-y-6 w-full">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Interpretación provisional.</strong> Los puntajes reflejan respuestas registradas, no un diagnóstico. Los bloques cognitivo y léxico solo se interpretan cuando el evaluador confirma que aplicó todos sus ejercicios. Los registros anteriores requieren esa confirmación.</div>
      {!canEdit && <p className="text-sm text-slate-600 print:hidden">Consulta institucional · La edición corresponde al responsable de esta evaluación.</p>}
      {/* Header (oculto al imprimir) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/evaluaciones" className="text-slate-500 hover:text-slate-700 shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 font-mono truncate">{est.codigo ?? "—"}</h1>
            <p className="text-sm text-slate-500 truncate">
              {est.grado} · {est.unidadEducativa} · {edad}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {canEdit && <DeleteButton
            endpoint={`/api/evaluaciones/${ev.id}`}
            redirectTo={`/estudiantes/${est.id}`}
            label="Eliminar"
            confirmMessage="¿Eliminar esta evaluación? No se puede deshacer."
          />}
          {canEdit && <Link
            href={`/evaluaciones/${ev.id}/editar`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Editar
          </Link>}
          <PrintButton />
          <Link
            href={`/evaluaciones/${ev.id}/padres`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-viria-700 border border-viria-200 rounded-lg hover:bg-viria-50"
          >
            Resumen para la familia
          </Link>
          {canCreate && <Link
            href={`/evaluaciones/nueva?estudianteId=${est.id}`}
            className="text-sm bg-viria-600 text-white px-3 py-2 rounded-lg hover:bg-viria-700"
          >
            Nueva evaluación
          </Link>}
        </div>
      </div>

      {/* === ENCABEZADO PROFESIONAL DEL INFORME (solo print) === */}
      <div className="hidden print:block">
        <div className="border-b-2 border-slate-800 pb-3 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[8pt] uppercase tracking-widest text-slate-500 mb-1">SIDEDA · Sistema de Evaluación de Dificultades de Aprendizaje</p>
              <h1 className="text-[20pt] font-bold text-slate-900 leading-tight m-0">Resumen de evaluación educativa</h1>
              <p className="text-[10pt] text-slate-600 mt-1">Registro adaptado de actividades educativas{scores.bpm.applied ? " · Incluye registros BPM" : ""}</p>
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
            <div><span className="text-slate-500">Edad:</span> <strong>{edad}</strong></div>
            <div><span className="text-slate-500">Grado:</span> <strong>{est.grado}</strong></div>
            <div><span className="text-slate-500">U. Educativa:</span> <strong>{est.unidadEducativa}</strong></div>
            <div><span className="text-slate-500">Fecha:</span> <strong>{new Date(ev.fecha).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })}</strong></div>
            <div className="col-span-3"><span className="text-slate-500">Evaluador/a:</span> <strong>{ev.evaluador}</strong></div>
          </div>
        </div>
      </div>

      <ReportTrace record={ev} scores={scores}/><ReportHistory id={ev.id}/>
      {/* Estado general */}
      <div className="flex items-center gap-4">
        <EstadoBadge estado={scores.estadoGeneral as EstadoAprendizaje} size="lg" />
        {scores.areasDificultad.length > 0 && (
          <div className="text-sm text-slate-600">
            <span className="font-medium">Áreas con señales para revisar: </span>
            {scores.areasDificultad.join(", ")}
          </div>
        )}
      </div>

      {scores.estadoGeneral === "evaluacion-incompleta" && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Resultado parcial.</strong> Completa lectura y escritura y confirma la aplicación de los bloques cognitivo y léxico para obtener la clasificación general.
          Los apartados pendientes no se consideran dificultades ni logros. Las áreas con dificultad que aparecen corresponden a los datos registrados.
        </div>
      )}
      <p className="text-xs text-slate-500">Clasificación calculada por el instrumento. La interpretación de IA se presenta por separado y requiere revisión del evaluador.</p>
      {/* Gráfica + scores cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Puntajes relativos al máximo de cada área</CardTitle>
          </CardHeader>
          <CardContent>
            <GraficoRadar scores={scores} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {[
            { label: "Comprensión Lectora", val: scores.lectura.comprensionTotal, max: 15, diff: scores.lectura.hasDifficulty, registro: scores.lectura.registro },
            { label: "Procesos Cognitivos", val: scores.cognitivo.totalCorrect, max: scores.cognitivo.totalItems, diff: scores.cognitivo.hasDifficulty, registro: scores.cognitivo.registro },
            { label: "Procesos Léxicos", val: scores.lexical.totalCorrect, max: scores.lexical.totalItems, diff: scores.lexical.hasDifficulty, registro: scores.lexical.registro },
            { label: "Escritura — Dictado", val: scores.dictado.positiveTotal, max: 34, diff: scores.dictado.hasDifficulty, registro: scores.dictado.registro },
            { label: "Escritura — Composición", val: scores.composicion.positiveTotal, max: 34, diff: scores.composicion.hasDifficulty, registro: scores.composicion.registro },
          ].map(({ label, val, max, diff, registro }) => {
            const complete = !registro || registro === "completo"
            const pct = Math.round((val / max) * 100)
            return (
              <div key={label} className="bg-white rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <span className={`text-xs font-bold ${!complete ? "text-slate-500" : diff ? "text-red-600" : "text-green-700"}`}>
                    {complete ? `${val}/${max}` : registro === "no-evaluado" ? "No evaluado" : "Incompleto"}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${diff ? "bg-red-400" : "bg-green-500"}`}
                    style={{ width: `${complete ? pct : 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {complete ? `${pct}% — ${diff ? "Señal para revisión" : "Sin alerta del instrumento"}` : "Completa el registro y confirma su aplicación para interpretar el resultado."}
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
          {scores.cognitivo.registro !== "completo" && <p className="text-xs text-slate-500">Respuestas marcadas; aplicación del bloque sin confirmar. No se interpreta el desempeño.</p>}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            {Object.entries(scores.cognitivo.byItem).map(([key, val]) => {
              const max = { item3a: 3, item3b: 3, item4: 2, item5a: 3, item5b: 1, item6: 3, item7: 1, item8: 4, item9: 4, item10: 3 }[key] ?? 1
              const label = { item3a: "3A Nombrar", item3b: "3B Explicar", item4: "4 Instruc.", item5a: "5A Clasif.", item5b: "5B Día/Noche", item6: "6 Orientac.", item7: "7 Secuenc.", item8: "8 Asociac.", item9: "9 Anagram.", item10: "10 Inferen." }[key]
              return (
                <div key={key} className={`rounded-lg p-2 border ${scores.cognitivo.registro !== "completo" ? "bg-slate-50 border-slate-200" : val === max ? "bg-green-50 border-green-200" : val === 0 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
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
          {scores.lexical.registro !== "completo" && <p className="text-xs text-slate-500">Respuestas marcadas; aplicación del bloque sin confirmar. No se interpreta el desempeño.</p>}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
            {Object.entries(scores.lexical.byItem).map(([key, val]) => {
              const max = { item11a: 4, item11b: 4, item12: 3, item13: 3, item14: 3 }[key] ?? 1
              const label = { item11a: "11A Produce rimas", item11b: "11B No rima", item12: "12 Sustitución", item13: "13 Omisión", item14: "14 Inversión" }[key]
              return (
                <div key={key} className={`rounded-lg p-2 border ${scores.lexical.registro !== "completo" ? "bg-slate-50 border-slate-200" : val === max ? "bg-green-50 border-green-200" : val === 0 ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
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
                const color = score <= 0 ? "bg-slate-50 border-slate-200" : score <= 1.5 ? "bg-red-50 border-red-200" : score <= 2.5 ? "bg-yellow-50 border-yellow-200" : score <= 3.5 ? "bg-viria-50 border-viria-200" : "bg-green-50 border-green-200"
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
            canGenerate={canEdit}
            analisisInicial={analisis}
            analisisGeneradoEn={ev.analisisGeneradoEn}
          />
        </CardContent>
      </Card>
    </div>
  )
}
