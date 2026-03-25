"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step12Sustitucion({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Ejercicio 12: Sustitución de fonemas" />
      <BoolItems state={state} set={set} items={[
        { field: "ej12a", label: 'En "mesa" quita la "e" y pon "i" → misa' },
        { field: "ej12b", label: 'En "casa" quita la primera "a" y pon "o" → cosa' },
        { field: "ej12c", label: 'En "solo" quita la última "o" y pon "a" → sola' },
      ]} />
    </div>
  )
}
