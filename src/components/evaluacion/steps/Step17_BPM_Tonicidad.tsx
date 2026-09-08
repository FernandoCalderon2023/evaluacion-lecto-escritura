"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { BpmScoreInput } from "./BpmScoreInput"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step17BpmTonicidad({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="BPM — 1ª Unidad: Tonicidad"
        subtitle="Batería Psicomotora (Da Fonseca) — versión depurada del instrumento"
        evalua="La inhibición motora a través de las sincinesias: los movimientos involuntarios (p. ej. de la boca) al escribir revelan inmadurez en el control tónico, que produce fatiga y trazos rígidos o temblorosos."
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
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Sincinesias</h3>
        <BpmScoreInput label="Bucales" value={state.bpm_sincinBucales as number | null} onChange={set("bpm_sincinBucales")} />
      </div>
    </div>
  )
}
