"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { BpmScoreInput } from "./BpmScoreInput"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step20BpmPraxiasET({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="BPM — 2ª/3ª Unidad: Estructuración E-T y Praxias" subtitle="Batería Psicomotora (Da Fonseca) — Espacio-temporal, praxia global y fina" />

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
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Estructuración Espacio-Temporal</h3>
        <BpmScoreInput label="Organización" value={state.bpm_etOrganizacion as number | null} onChange={set("bpm_etOrganizacion")} />
        <BpmScoreInput label="Estructuración dinámica" value={state.bpm_etEstructDinamica as number | null} onChange={set("bpm_etEstructDinamica")} />
        <BpmScoreInput label="Representación topográfica" value={state.bpm_etRepTopografica as number | null} onChange={set("bpm_etRepTopografica")} />
        <BpmScoreInput label="Estructuración rítmica" value={state.bpm_etEstructRitmica as number | null} onChange={set("bpm_etEstructRitmica")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Praxia Global</h3>
        <BpmScoreInput label="Coordinación óculo-manual" value={state.bpm_pgCoordOculoManual as number | null} onChange={set("bpm_pgCoordOculoManual")} />
        <BpmScoreInput label="Coordinación óculo-podal" value={state.bpm_pgCoordOculoPodal as number | null} onChange={set("bpm_pgCoordOculoPodal")} />
        <BpmScoreInput label="Dismetría" value={state.bpm_pgDismetria as number | null} onChange={set("bpm_pgDismetria")} />
        <BpmScoreInput label="Disociación" value={state.bpm_pgDisociacion as number | null} onChange={set("bpm_pgDisociacion")} />
        <BpmScoreInput label="Miembros superiores" value={state.bpm_pgMS as number | null} onChange={set("bpm_pgMS")} />
        <BpmScoreInput label="Miembros inferiores" value={state.bpm_pgMI as number | null} onChange={set("bpm_pgMI")} />
        <BpmScoreInput label="Agilidades" value={state.bpm_pgAgilidades as number | null} onChange={set("bpm_pgAgilidades")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Praxia Fina</h3>
        <BpmScoreInput label="Coordinación dinámica manual" value={state.bpm_pfCoordDinamManual as number | null} onChange={set("bpm_pfCoordDinamManual")} />
        <BpmScoreInput label="Tamborilear" value={state.bpm_pfTamborilear as number | null} onChange={set("bpm_pfTamborilear")} />
        <BpmScoreInput label="Velocidad-precisión" value={state.bpm_pfVelocidadPrecision as number | null} onChange={set("bpm_pfVelocidadPrecision")} />
      </div>
    </div>
  )
}
