"use client"
import { EvaluacionFormData, ScaleValue, PositionValue, TonoVoz } from "@/types/evaluacion"
import { ScaleSelector } from "@/components/shared/ScaleSelector"
import { PositionSelector } from "@/components/shared/PositionSelector"
import { cn } from "@/lib/utils"

interface Props {
  state: Partial<EvaluacionFormData>
  set: (field: keyof EvaluacionFormData) => (v: unknown) => void
}

const TONOS: { value: TonoVoz; label: string }[] = [
  { value: "grave", label: "Grave" },
  { value: "medio", label: "Medio" },
  { value: "agudo", label: "Agudo" },
]

export function Step01Lectura({ state, set }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">Ejercicio 1: Lectura en Voz Alta</h2>
      <p className="text-sm text-slate-500">Texto: &quot;El Pajarito Intoxicado&quot;</p>

      {/* Expresividad */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Expresividad</h3>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Tono de voz</label>
          <div className="flex gap-2">
            {TONOS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => set("tonoVoz")(t.value)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm border font-medium transition-colors",
                  state.tonoVoz === t.value
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-300 text-slate-600 hover:border-blue-400"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Expresión de matices emocionales (1 = ninguno, 4 = muy expresivo)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set("expresionMatices")(n)}
                className={cn(
                  "w-10 h-10 rounded-lg border font-bold text-sm transition-colors",
                  state.expresionMatices === n
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-300 text-slate-600 hover:border-blue-400"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <ScaleSelector label="Respeta los signos de puntuación" value={state.respetaSignosPunt ?? "AV"} onChange={(v) => set("respetaSignosPunt")(v)} />
        <ScaleSelector label="Lectura vacilante" value={state.lecturaVacilante ?? "AV"} onChange={(v) => set("lecturaVacilante")(v)} />
        <ScaleSelector label="Lectura silábica" value={state.lecturaSilabica ?? "AV"} onChange={(v) => set("lecturaSilabica")(v)} />
        <ScaleSelector label="Lectura corriente (fluida)" value={state.lecturaCorriente ?? "AV"} onChange={(v) => set("lecturaCorriente")(v)} />
      </div>

      {/* Errores */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">
          Errores en la lectura — posición donde ocurre
        </h3>
        <PositionSelector label="Cambios de letras (ej: b→d)" value={state.errorCambioLetras ?? "N"} onChange={(v) => set("errorCambioLetras")(v)} />
        <PositionSelector label="Cambios de sílabas" value={state.errorCambioSilabas ?? "N"} onChange={(v) => set("errorCambioSilabas")(v)} />
        <PositionSelector label="Cambios de palabras" value={state.errorCambioPalabras ?? "N"} onChange={(v) => set("errorCambioPalabras")(v)} />
        <PositionSelector label="Omisión de sonidos" value={state.errorOmision ?? "N"} onChange={(v) => set("errorOmision")(v)} />
        <PositionSelector label="Adición de sonidos" value={state.errorAdicion ?? "N"} onChange={(v) => set("errorAdicion")(v)} />
        <PositionSelector label="Repeticiones" value={state.errorRepeticion ?? "N"} onChange={(v) => set("errorRepeticion")(v)} />
        <PositionSelector label="Rotaciones (b↔d, p↔q, u↔n)" value={state.errorRotacion ?? "N"} onChange={(v) => set("errorRotacion")(v)} />
        <PositionSelector label="Inversiones (el↔le, sol↔los)" value={state.errorInversion ?? "N"} onChange={(v) => set("errorInversion")(v)} />
      </div>

      {/* Comprensión */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">
          Comprensión lectora — 6 preguntas del texto
        </h3>
        <ScaleSelector label="Memoriza aspectos significativos del texto" value={state.compMemoriza ?? "AV"} onChange={(v) => set("compMemoriza")(v)} />
        <ScaleSelector label="Establece ideas centrales y secundarias" value={state.compIdeas ?? "AV"} onChange={(v) => set("compIdeas")(v)} />
        <ScaleSelector label="Valora el contenido del texto" value={state.compValora ?? "AV"} onChange={(v) => set("compValora")(v)} />
        <ScaleSelector label="Interpreta el texto" value={state.compInterpreta ?? "AV"} onChange={(v) => set("compInterpreta")(v)} />
        <ScaleSelector label="Asocia con otros contextos y situaciones" value={state.compAsocia ?? "AV"} onChange={(v) => set("compAsocia")(v)} />
      </div>
    </div>
  )
}
