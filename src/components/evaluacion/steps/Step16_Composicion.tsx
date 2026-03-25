"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { WritingRubric } from "./WritingRubric"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step16Composicion({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title='Ejercicio 16: Composición libre — "Mis bonitas vacaciones"' subtitle="Evalúa la producción escrita espontánea del estudiante" />
      <WritingRubric prefix="comp" state={state} set={set} />
    </div>
  )
}
