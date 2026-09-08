"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { BpmScoreInput } from "./BpmScoreInput"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step18BpmEquilibrio({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="BPM — 1ª Unidad: Equilibrio"
        subtitle="Batería Psicomotora (Da Fonseca) — equilibrio dinámico (saltos)"
        evalua="El equilibrio dinámico en los saltos: la seguridad gravitatoria que libera atención y energía para concentrarse en el aprendizaje."
      />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
        <p className="font-semibold mb-1">Escala de puntuación BPM</p>
        <div className="grid grid-cols-4 gap-2">
          <span><strong className="text-red-600">1</strong> — Débil (apráxico)</span>
          <span><strong className="text-yellow-600">2</strong> — Satisfactorio (dispráxico)</span>
          <span><strong className="text-viria-600">3</strong> — Bueno (eupráxico)</span>
          <span><strong className="text-green-600">4</strong> — Excelente (hiperpráxico)</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Equilibrio Dinámico — Saltos</h3>
        <BpmScoreInput label="Pie cojo izquierdo" value={state.bpm_eqPieCojoIzq as number | null} onChange={set("bpm_eqPieCojoIzq")} />
        <BpmScoreInput label="Pie cojo derecho" value={state.bpm_eqPieCojoDer as number | null} onChange={set("bpm_eqPieCojoDer")} />
        <BpmScoreInput label="Pies juntos adelante" value={state.bpm_eqPiesJuntosAdel as number | null} onChange={set("bpm_eqPiesJuntosAdel")} />
        <BpmScoreInput label="Pies juntos atrás" value={state.bpm_eqPiesJuntosAtras as number | null} onChange={set("bpm_eqPiesJuntosAtras")} />
        <BpmScoreInput label="Pies juntos con ojos cerrados" value={state.bpm_eqPiesJuntosOjosCerr as number | null} onChange={set("bpm_eqPiesJuntosOjosCerr")} />
      </div>
    </div>
  )
}
