"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step09Anagramas({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Ejercicio 9: Ordena las letras para formar palabras" />
      <BoolItems state={state} set={set} items={[
        { field: "ej9a", label: "a) rañeba → bañera" },
        { field: "ej9b", label: "b) llónsi → sillón" },
        { field: "ej9c", label: "c) mónli → limón" },
        { field: "ej9d", label: "d) ranjana → naranja" },
      ]} />
    </div>
  )
}
