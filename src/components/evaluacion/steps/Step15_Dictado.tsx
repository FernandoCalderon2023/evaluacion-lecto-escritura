"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { WritingRubric } from "./WritingRubric"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step15Dictado({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Ejercicio 15: Dictado" subtitle="Evalúa la expresión escrita del estudiante durante el dictado" />
      <WritingRubric prefix="dict" state={state} set={set} />
    </div>
  )
}
