"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { BpmScoreInput, BpmLateralityInput } from "./BpmScoreInput"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step19BpmLateralidadCuerpo({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="BPM — 2ª Unidad: Lateralidad y Noción del Cuerpo" subtitle="Batería Psicomotora (Da Fonseca)" />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
        <p className="font-semibold mb-1">Escala de puntuación BPM</p>
        <div className="grid grid-cols-4 gap-2">
          <span><strong className="text-red-600">1</strong> — Débil (apráxico)</span>
          <span><strong className="text-yellow-600">2</strong> — Satisfactorio (dispráxico)</span>
          <span><strong className="text-blue-600">3</strong> — Bueno (eupráxico)</span>
          <span><strong className="text-green-600">4</strong> — Excelente (hiperpráxico)</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Lateralidad</h3>
        <BpmLateralityInput label="Ocular" value={state.bpm_latOcular as string | null} onChange={set("bpm_latOcular")} />
        <BpmLateralityInput label="Auditiva" value={state.bpm_latAuditiva as string | null} onChange={set("bpm_latAuditiva")} />
        <BpmLateralityInput label="Manual" value={state.bpm_latManual as string | null} onChange={set("bpm_latManual")} />
        <BpmLateralityInput label="Pedal" value={state.bpm_latPedal as string | null} onChange={set("bpm_latPedal")} />
        <BpmLateralityInput label="Innata" value={state.bpm_latInnata as string | null} onChange={set("bpm_latInnata")} />
        <BpmLateralityInput label="Adquirida" value={state.bpm_latAdquirida as string | null} onChange={set("bpm_latAdquirida")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Noción del Cuerpo</h3>
        <BpmScoreInput label="Sentido kinestésico" value={state.bpm_sentidoKinest as number | null} onChange={set("bpm_sentidoKinest")} />
        <BpmScoreInput label="Reconocimiento I/D" value={state.bpm_reconocimientoID as number | null} onChange={set("bpm_reconocimientoID")} />
        <BpmScoreInput label="Autoimagen - Cara" value={state.bpm_autoimagenCara as number | null} onChange={set("bpm_autoimagenCara")} />
        <BpmScoreInput label="Imitación de gestos" value={state.bpm_imitacionGestos as number | null} onChange={set("bpm_imitacionGestos")} />
        <BpmScoreInput label="Dibujo del cuerpo" value={state.bpm_dibujoCuerpo as number | null} onChange={set("bpm_dibujoCuerpo")} />
      </div>
    </div>
  )
}
