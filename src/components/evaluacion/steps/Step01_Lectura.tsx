"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { ScaleSelector } from "@/components/shared/ScaleSelector"
import { PositionSelector } from "@/components/shared/PositionSelector"
import { SectionTitle } from "./StepUtils"
import { cn } from "@/lib/utils"

interface Props {
  state: Partial<EvaluacionFormData>
  set: (field: keyof EvaluacionFormData) => (v: unknown) => void
}


export function Step01Lectura({ state, set }: Props) {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="Ejercicio 1: Lectura en Voz Alta"
        subtitle={'Texto: "El Pajarito Intoxicado"'}
        evalua="El núcleo del proceso lector: la fluidez lectora (velocidad y tipo de lectura), los errores específicos de decodificación (cambios, omisiones, inversiones) y la comprensión por niveles (memoriza, ideas centrales, valora, interpreta, asocia)."
      />

      {/* Palabras leídas */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-2">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Registro de lectura</h3>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800">Número de palabras leídas en 4 minutos</label>
          <input
            type="number"
            min={0}
            placeholder="Ej: 45"
            value={state.palabrasLeidas ?? ""}
            onChange={(e) => set("palabrasLeidas")(e.target.value ? Number(e.target.value) : null)}
            className="w-full max-w-xs border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500 font-bold text-lg"
          />
        </div>
      </div>

      {/* Expresividad */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-4">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Expresividad</h3>

        <div className="bg-viria-50 border border-viria-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-viria-700 mb-1">Expresión de matices emocionales</p>
          <p className="text-xs text-viria-600">Se evalúa a través de los 3 indicadores siguientes. Puede dejar en blanco si no aplica.</p>
        </div>

        <ScaleSelector label="Lectura vacilante" value={state.lecturaVacilante} onChange={(v) => set("lecturaVacilante")(v)} />
        <ScaleSelector label="Lectura silábica" value={state.lecturaSilabica} onChange={(v) => set("lecturaSilabica")(v)} />
        <ScaleSelector label="Lectura corriente (fluida)" value={state.lecturaCorriente} onChange={(v) => set("lecturaCorriente")(v)} />
      </div>

      {/* Errores */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">
          Errores en la lectura — posición donde ocurre
        </h3>
        <p className="text-xs text-slate-500">Haga clic de nuevo para desmarcar. Puede dejar en blanco si no aplica.</p>
        <PositionSelector label="Cambios de letras (ej: b→d)" value={state.errorCambioLetras} onChange={(v) => set("errorCambioLetras")(v)} />
        <PositionSelector label="Cambios de sílabas" value={state.errorCambioSilabas} onChange={(v) => set("errorCambioSilabas")(v)} />
        <PositionSelector label="Cambios de palabras" value={state.errorCambioPalabras} onChange={(v) => set("errorCambioPalabras")(v)} />
        <PositionSelector label="Omisión de sonidos" value={state.errorOmision} onChange={(v) => set("errorOmision")(v)} />
        <PositionSelector label="Adición de sonidos" value={state.errorAdicion} onChange={(v) => set("errorAdicion")(v)} />
        <PositionSelector label="Repeticiones" value={state.errorRepeticion} onChange={(v) => set("errorRepeticion")(v)} />
        <PositionSelector label="Rotaciones (b↔d, p↔q, u↔n)" value={state.errorRotacion} onChange={(v) => set("errorRotacion")(v)} />
        <PositionSelector label="Inversiones (el↔le, sol↔los)" value={state.errorInversion} onChange={(v) => set("errorInversion")(v)} />
      </div>

      {/* Comprensión */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">
          Comprensión lectora — 6 preguntas del texto
        </h3>
        <ScaleSelector label="Memoriza aspectos significativos del texto" value={state.compMemoriza} onChange={(v) => set("compMemoriza")(v)} />
        <ScaleSelector label="Establece ideas centrales y secundarias" value={state.compIdeas} onChange={(v) => set("compIdeas")(v)} />
        <ScaleSelector label="Valora el contenido del texto" value={state.compValora} onChange={(v) => set("compValora")(v)} />
        <ScaleSelector label="Interpreta el texto" value={state.compInterpreta} onChange={(v) => set("compInterpreta")(v)} />
        <ScaleSelector label="Asocia con otros contextos y situaciones" value={state.compAsocia} onChange={(v) => set("compAsocia")(v)} />
      </div>
    </div>
  )
}
