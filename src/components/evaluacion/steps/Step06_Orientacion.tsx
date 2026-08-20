"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step06Orientacion({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Ejercicio 6: Orientación espacial con figuras geométricas"
        evalua="Las nociones espaciales (izquierda-derecha, encima-debajo) sobre figuras. Es la base de la direccionalidad que exige la lecto-escritura (dónde empieza la letra, hacia dónde avanza el renglón)."
      />
      <BoolItems state={state} set={set} items={[
        { field: "ej6a", label: "a) Cruz (+) en el círculo al lado izquierdo del rectángulo negro" },
        { field: "ej6b", label: "b) Cruz (+) debajo del rectángulo que tiene encima un círculo blanco" },
        { field: "ej6c", label: "c) Cruz (+) a la derecha de los círculos negros unidos" },
      ]} />
    </div>
  )
}
