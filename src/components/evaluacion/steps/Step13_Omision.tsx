"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step13Omision({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Ejercicio 13: Omisión de fonemas" />
      <BoolItems state={state} set={set} items={[
        { field: "ej13a", label: 'Si a "toro" le quitamos la "t" → oro' },
        { field: "ej13b", label: 'Si a "dama" le quitamos la "d" → ama' },
        { field: "ej13c", label: 'Si a "rana" le quitamos la "r" → ana' },
      ]} />
    </div>
  )
}
