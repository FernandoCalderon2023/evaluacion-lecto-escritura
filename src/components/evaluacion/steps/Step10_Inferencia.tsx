"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step10Inferencia({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Ejercicio 10: Inferencia" subtitle="El estudiante debe inferir la respuesta a partir de la situación" />
      <BoolItems state={state} set={set} items={[
        { field: "ej10a", label: "a) El niño tomó leche y se quemó. ¿Cómo estaba la leche?", description: "Respuesta: caliente / muy caliente" },
        { field: "ej10b", label: "b) Tomaste agua y se te enfriaron los labios. ¿Cómo estaba el agua?", description: "Respuesta: fría / muy fría" },
        { field: "ej10c", label: "c) Jorge ayuda a su mamá. ¿Cómo es Jorge?", description: "Respuesta: bueno / responsable / amable" },
      ]} />
    </div>
  )
}
