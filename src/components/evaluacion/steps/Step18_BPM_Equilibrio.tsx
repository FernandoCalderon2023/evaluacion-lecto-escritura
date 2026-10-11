"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { BpmScoreInput } from "./BpmScoreInput"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step18BpmEquilibrio({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle helpStep={17}
        title="BPM — 1ª Unidad: Equilibrio"
        subtitle="Batería Psicomotora (Da Fonseca) — equilibrio dinámico (saltos)"
        evalua="Observa el control corporal durante las tareas de equilibrio dinámico indicadas por el protocolo profesional."
      />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
        <p className="font-semibold mb-1">Escala de puntuación BPM</p>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-4 gap-2">
          <span><strong className="text-red-600">1</strong> — Débil (apráxico)</span>
          <span><strong className="text-yellow-600">2</strong> — Satisfactorio (dispráxico)</span>
          <span><strong className="text-viria-600">3</strong> — Bueno (eupráxico)</span>
          <span><strong className="text-green-600">4</strong> — Excelente (hiperpráxico)</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Equilibrio Dinámico — Saltos</h3>
        <BpmScoreInput label="Pie cojo izquierdo" helpKey="bpm_eqPieCojoIzq" value={state.bpm_eqPieCojoIzq as number | null} onChange={set("bpm_eqPieCojoIzq")} />
        <BpmScoreInput label="Pie cojo derecho" helpKey="bpm_eqPieCojoDer" value={state.bpm_eqPieCojoDer as number | null} onChange={set("bpm_eqPieCojoDer")} />
        <BpmScoreInput label="Pies juntos adelante" helpKey="bpm_eqPiesJuntosAdel" value={state.bpm_eqPiesJuntosAdel as number | null} onChange={set("bpm_eqPiesJuntosAdel")} />
        <BpmScoreInput label="Pies juntos atrás" helpKey="bpm_eqPiesJuntosAtras" value={state.bpm_eqPiesJuntosAtras as number | null} onChange={set("bpm_eqPiesJuntosAtras")} />
        <BpmScoreInput label="Pies juntos con ojos cerrados" helpKey="bpm_eqPiesJuntosOjosCerr" value={state.bpm_eqPiesJuntosOjosCerr as number | null} onChange={set("bpm_eqPiesJuntosOjosCerr")} />
      </div>
    </div>
  )
}
