"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step14Inversion({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Ejercicio 14: Inversión de sílabas" subtitle='La sílaba contraria de "no" es "on"' />
      <BoolItems state={state} set={set} items={[
        { field: "ej14a", label: 'Sílaba contraria de "el" → le' },
        { field: "ej14b", label: 'Sílaba contraria de "se" → es' },
        { field: "ej14c", label: 'Sílaba contraria de "ed" → de' },
      ]} />
    </div>
  )
}
