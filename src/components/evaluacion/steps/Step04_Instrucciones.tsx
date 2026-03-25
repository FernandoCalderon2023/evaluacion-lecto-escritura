"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step04Instrucciones({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Ejercicio 4: Sigue instrucciones escritas" subtitle="Lee la oración y realiza la acción indicada" />
      <BoolItems state={state} set={set} items={[
        { field: "ej4a", label: "a) Encierra en un círculo al de mayor tamaño", description: "El pájaro (azul) es más grande que el conejo → debe encerrar el pájaro" },
        { field: "ej4b", label: "b) Subraya el más pequeño", description: "El gato es más pequeño que la vaca → debe subrayar el gato" },
      ]} />
    </div>
  )
}
