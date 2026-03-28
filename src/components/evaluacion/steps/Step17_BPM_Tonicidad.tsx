"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { BpmScoreInput } from "./BpmScoreInput"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step17BpmTonicidad({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="BPM — 1ª Unidad: Tonicidad" subtitle="Batería Psicomotora (Da Fonseca) — Control respiratorio y tonicidad" />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
        <p className="font-semibold mb-1">Escala de puntuación BPM</p>
        <div className="grid grid-cols-4 gap-2">
          <span><strong className="text-red-600">1</strong> — Débil (apráxico)</span>
          <span><strong className="text-yellow-600">2</strong> — Satisfactorio (dispráxico)</span>
          <span><strong className="text-blue-600">3</strong> — Bueno (eupráxico)</span>
          <span><strong className="text-green-600">4</strong> — Excelente (hiperpráxico)</span>
        </div>
      </div>

        {/* Aspecto Somático */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Aspecto Somático</h3>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">Tipo somático</label>
            <div className="flex gap-2">
              {["ECTO", "MESO", "ENDO"].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => set("bpm_tipoSomatico")(state.bpm_tipoSomatico === tipo ? null : tipo)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${
                    state.bpm_tipoSomatico === tipo
                      ? "bg-blue-600 border-blue-600 text-white shadow-md"
                      : "bg-white border-slate-300 text-slate-700 hover:border-blue-400"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-800">Desviaciones posturales</label>
            <input
              type="text"
              placeholder="Describir desviaciones observadas..."
              value={state.bpm_desviacionesPosturales ?? ""}
              onChange={(e) => set("bpm_desviacionesPosturales")(e.target.value || null)}
              className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Control Respiratorio</h3>
        <BpmScoreInput label="Inspiración" value={state.bpm_inspiracion as number | null} onChange={set("bpm_inspiracion")} />
        <BpmScoreInput label="Espiración" value={state.bpm_espiracion as number | null} onChange={set("bpm_espiracion")} />
        <BpmScoreInput label="Apnea" value={state.bpm_apnea as number | null} onChange={set("bpm_apnea")} />
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-semibold text-slate-800">Duración de la apnea</label>
            <input
              type="text"
              placeholder="Ej: 15 segundos"
              value={state.bpm_apneaDuracion ?? ""}
              onChange={(e) => set("bpm_apneaDuracion")(e.target.value || null)}
              className="w-full max-w-xs border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Fatigabilidad</h3>
        <BpmScoreInput label="Fatigabilidad" value={state.bpm_fatigabilidad as number | null} onChange={set("bpm_fatigabilidad")} />
      </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Tonicidad — Tipo</h3>
          <div className="flex gap-2">
            {[
              { val: "HIPO", label: "Hipotonicidad" },
              { val: "HIPER", label: "Hipertonicidad" },
            ].map((t) => (
              <button
                key={t.val}
                type="button"
                onClick={() => set("bpm_tonicidadTipo")(state.bpm_tonicidadTipo === t.val ? null : t.val)}
                className={`px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${
                  state.bpm_tonicidadTipo === t.val
                    ? "bg-purple-600 border-purple-600 text-white shadow-md"
                    : "bg-white border-slate-300 text-slate-700 hover:border-purple-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Extensibilidad</h3>
        <BpmScoreInput label="Miembros inferiores" value={state.bpm_extensibilidadMI as number | null} onChange={set("bpm_extensibilidadMI")} />
        <BpmScoreInput label="Miembros superiores" value={state.bpm_extensibilidadMS as number | null} onChange={set("bpm_extensibilidadMS")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Pasividad</h3>
        <BpmScoreInput label="Pasividad" value={state.bpm_pasividad as number | null} onChange={set("bpm_pasividad")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Paratonía</h3>
        <BpmScoreInput label="Miembros inferiores" value={state.bpm_paratoniaMI as number | null} onChange={set("bpm_paratoniaMI")} />
        <BpmScoreInput label="Miembros superiores" value={state.bpm_paratoniaMS as number | null} onChange={set("bpm_paratoniaMS")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Diadococinesias</h3>
        <BpmScoreInput label="Mano derecha" value={state.bpm_diadocMD as number | null} onChange={set("bpm_diadocMD")} />
        <BpmScoreInput label="Mano izquierda" value={state.bpm_diadocMI as number | null} onChange={set("bpm_diadocMI")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Sincinesias</h3>
        <BpmScoreInput label="Bucales" value={state.bpm_sincinBucales as number | null} onChange={set("bpm_sincinBucales")} />
        <BpmScoreInput label="Contralaterales" value={state.bpm_sincinContralat as number | null} onChange={set("bpm_sincinContralat")} />
      </div>
    </div>
  )
}
