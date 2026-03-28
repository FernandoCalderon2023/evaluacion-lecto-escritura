"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"

interface Props {
  state: Partial<EvaluacionFormData>
  set: (field: keyof EvaluacionFormData) => (v: unknown) => void
}

function LetterScore({ label, letters, max, field, value, onChange }: {
  label: string
  letters: string
  max: number
  field: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="border-2 border-slate-200 rounded-lg p-4 space-y-2">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-500">Letras faltantes: <span className="font-bold text-slate-700">{letters}</span> (máx. {max} puntos)</p>
      <div className="flex gap-2 items-center">
        <span className="text-xs text-slate-600 font-medium">Letras correctas:</span>
        <div className="flex gap-1">
          {Array.from({ length: max + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              className={`w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all ${
                value === i
                  ? i === max ? "bg-green-600 border-green-600 text-white shadow-md"
                    : i === 0 ? "bg-red-500 border-red-500 text-white shadow-md"
                    : "bg-yellow-500 border-yellow-500 text-white shadow-md"
                  : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Step02Letras({ state, set }: Props) {
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Ejercicio 2: Completar Letras"
        subtitle="Calificar por cada letra correcta que completó el estudiante"
      />

      <LetterScore
        label='Bici _ _ _ ta → "Bicicleta"'
        letters="C, L, E"
        max={3}
        field="ej2Bicicleta"
        value={state.ej2Bicicleta ?? 0}
        onChange={(v) => set("ej2Bicicleta")(v)}
      />

      <LetterScore
        label='Mari _ osa → "Mariposa"'
        letters="P"
        max={1}
        field="ej2Mariposa"
        value={state.ej2Mariposa ?? 0}
        onChange={(v) => set("ej2Mariposa")(v)}
      />

      <LetterScore
        label='p _ _ → "Pez"'
        letters="E, Z"
        max={2}
        field="ej2Pez"
        value={state.ej2Pez ?? 0}
        onChange={(v) => set("ej2Pez")(v)}
      />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
        <strong>Total máximo:</strong> 6 puntos (3 + 1 + 2). Actual: <strong>{(state.ej2Bicicleta ?? 0) + (state.ej2Mariposa ?? 0) + (state.ej2Pez ?? 0)}/6</strong>
      </div>
    </div>
  )
}
