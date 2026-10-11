"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { BpmScoreInput } from "./BpmScoreInput"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step20BpmPraxiasET({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle helpStep={19}
        title="BPM — 2ª/3ª Unidad: Estructuración E-T y Praxias"
        subtitle="Batería Psicomotora (Da Fonseca) — Espacio-temporal, praxia global y fina"
        evalua="Observa la organización espacial, las secuencias, el ritmo y la coordinación de movimientos amplios y finos en las tareas profesionales."
      />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
        <p className="font-semibold mb-1">Escala de puntuación BPM</p>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-4 gap-2">
          <span><strong className="text-green-600">4</strong> — Excelente (hiperpráxico)</span>
          <span><strong className="text-viria-600">3</strong> — Bueno (eupráxico)</span>
          <span><strong className="text-yellow-600">2</strong> — Satisfactorio (dispráxico)</span>
          <span><strong className="text-red-600">1</strong> — Débil (apráxico)</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Estructuración Espacio-Temporal</h3>
        <BpmScoreInput label="Organización" helpKey="bpm_etOrganizacion" value={state.bpm_etOrganizacion as number | null} onChange={set("bpm_etOrganizacion")} />
        <BpmScoreInput label="Estructuración dinámica" helpKey="bpm_etEstructDinamica" value={state.bpm_etEstructDinamica as number | null} onChange={set("bpm_etEstructDinamica")} />
        <BpmScoreInput label="Estructuración rítmica" helpKey="bpm_etEstructRitmica" value={state.bpm_etEstructRitmica as number | null} onChange={set("bpm_etEstructRitmica")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Praxia Global</h3>
        <BpmScoreInput label="Coordinación óculo-manual" helpKey="bpm_pgCoordOculoManual" value={state.bpm_pgCoordOculoManual as number | null} onChange={set("bpm_pgCoordOculoManual")} />
        <BpmScoreInput label="Disociación" helpKey="bpm_pgDisociacion" value={state.bpm_pgDisociacion as number | null} onChange={set("bpm_pgDisociacion")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Praxia Fina</h3>

        {/* Coordinación dinámica manual + tiempo */}
        <BpmScoreInput label="Coordinación dinámica manual" helpKey="bpm_pfCoordDinamManual" value={state.bpm_pfCoordDinamManual as number | null} onChange={set("bpm_pfCoordDinamManual")} />
        <div className="pl-4 space-y-1.5">
          <label className="text-xs font-semibold text-slate-600">Tiempo</label>
          <input
            type="text"
            placeholder="Ej: 2 min 30 seg"
            value={state.bpm_pfCoordTiempo ?? ""}
            onChange={(e) => set("bpm_pfCoordTiempo")(e.target.value || null)}
            className="w-full max-w-xs border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500"
          />
        </div>

        {/* Tamborilear */}
        <BpmScoreInput label="Tamborilear" helpKey="bpm_pfTamborilear" value={state.bpm_pfTamborilear as number | null} onChange={set("bpm_pfTamborilear")} />

        {/* Velocidad-precisión + puntos y cruces */}
        <BpmScoreInput label="Velocidad-precisión" helpKey="bpm_pfVelocidadPrecision" value={state.bpm_pfVelocidadPrecision as number | null} onChange={set("bpm_pfVelocidadPrecision")} />
        <div className="grid grid-cols-1 sm:pl-4 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Número de puntos</label>
            <input
              type="number"
              min={0}
              placeholder="Ej: 12"
              value={state.bpm_pfNumeroPuntos ?? ""}
              onChange={(e) => set("bpm_pfNumeroPuntos")(e.target.value ? Number(e.target.value) : null)}
              className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">Número de cruces</label>
            <input
              type="number"
              min={0}
              placeholder="Ej: 8"
              value={state.bpm_pfNumeroCruces ?? ""}
              onChange={(e) => set("bpm_pfNumeroCruces")(e.target.value ? Number(e.target.value) : null)}
              className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
