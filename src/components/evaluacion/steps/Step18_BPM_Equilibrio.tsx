"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { BpmScoreInput } from "./BpmScoreInput"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step18BpmEquilibrio({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="BPM — 1ª Unidad: Equilibrio" subtitle="Batería Psicomotora (Da Fonseca) — Inmovilidad, equilibrio estático y dinámico" />

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
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Inmovilidad</h3>
        <BpmScoreInput label="Inmovilidad" value={state.bpm_inamovilidad as number | null} onChange={set("bpm_inamovilidad")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Equilibrio Estático</h3>
        <BpmScoreInput label="Apoyo rectilíneo" value={state.bpm_eqApoyoRect as number | null} onChange={set("bpm_eqApoyoRect")} />
        <BpmScoreInput label="Punta de los pies" value={state.bpm_eqPuntaPies as number | null} onChange={set("bpm_eqPuntaPies")} />
        <BpmScoreInput label="Apoyo en un pie" value={state.bpm_eqApoyoUnPie as number | null} onChange={set("bpm_eqApoyoUnPie")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Equilibrio Dinámico - Marcha</h3>
        <BpmScoreInput label="Marcha controlada" value={state.bpm_eqMarchaControl as number | null} onChange={set("bpm_eqMarchaControl")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Equilibrio Dinámico - Banco</h3>
        <BpmScoreInput label="Hacia adelante" value={state.bpm_eqBancoAdelante as number | null} onChange={set("bpm_eqBancoAdelante")} />
        <BpmScoreInput label="Hacia atrás" value={state.bpm_eqBancoAtras as number | null} onChange={set("bpm_eqBancoAtras")} />
        <BpmScoreInput label="Lado derecho" value={state.bpm_eqBancoDerecho as number | null} onChange={set("bpm_eqBancoDerecho")} />
        <BpmScoreInput label="Lado izquierdo" value={state.bpm_eqBancoIzquierdo as number | null} onChange={set("bpm_eqBancoIzquierdo")} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">Equilibrio Dinámico - Saltos</h3>
        <BpmScoreInput label="Pie cojo izquierdo" value={state.bpm_eqPieCojoIzq as number | null} onChange={set("bpm_eqPieCojoIzq")} />
        <BpmScoreInput label="Pie cojo derecho" value={state.bpm_eqPieCojoDer as number | null} onChange={set("bpm_eqPieCojoDer")} />
        <BpmScoreInput label="Pies juntos adelante" value={state.bpm_eqPiesJuntosAdel as number | null} onChange={set("bpm_eqPiesJuntosAdel")} />
        <BpmScoreInput label="Pies juntos atrás" value={state.bpm_eqPiesJuntosAtras as number | null} onChange={set("bpm_eqPiesJuntosAtras")} />
        <BpmScoreInput label="Pies juntos con ojos cerrados" value={state.bpm_eqPiesJuntosOjosCerr as number | null} onChange={set("bpm_eqPiesJuntosOjosCerr")} />
      </div>
    </div>
  )
}
