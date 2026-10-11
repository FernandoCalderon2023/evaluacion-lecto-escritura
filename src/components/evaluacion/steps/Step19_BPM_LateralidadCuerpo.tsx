"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { BpmScoreInput, BpmLateralityInput } from "./BpmScoreInput"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step19BpmLateralidadCuerpo({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle helpStep={18}
        title="BPM — 2ª Unidad: Lateralidad y Noción del Cuerpo"
        subtitle="Batería Psicomotora (Da Fonseca)"
        evalua="Registra el lado utilizado en las pruebas de ojo, oído, mano y pie, y las tareas de reconocimiento y representación del cuerpo."
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
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Lateralidad</h3>
        <BpmLateralityInput label="Ocular" helpKey="bpm_latOcular" value={state.bpm_latOcular as string | null} onChange={set("bpm_latOcular")} />
        <BpmLateralityInput label="Auditiva" helpKey="bpm_latAuditiva" value={state.bpm_latAuditiva as string | null} onChange={set("bpm_latAuditiva")} />
        <BpmLateralityInput label="Manual" helpKey="bpm_latManual" value={state.bpm_latManual as string | null} onChange={set("bpm_latManual")} />
        <BpmLateralityInput label="Podal" helpKey="bpm_latPodal" value={state.bpm_latPodal as string | null} onChange={set("bpm_latPodal")} />
          <BpmScoreInput
            label="Puntaje general de lateralidad" helpKey="bpm_latScore"
            value={state.bpm_latScore}
            onChange={(v) => set("bpm_latScore")(v)}
          />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Noción del Cuerpo</h3>
        <BpmScoreInput label="Reconocimiento I/D" helpKey="bpm_reconocimientoID" value={state.bpm_reconocimientoID as number | null} onChange={set("bpm_reconocimientoID")} />
        <BpmScoreInput label="Imitación de gestos" helpKey="bpm_imitacionGestos" value={state.bpm_imitacionGestos as number | null} onChange={set("bpm_imitacionGestos")} />
        <BpmScoreInput label="Dibujo del cuerpo" helpKey="bpm_dibujoCuerpo" value={state.bpm_dibujoCuerpo as number | null} onChange={set("bpm_dibujoCuerpo")} />
      </div>
    </div>
  )
}
