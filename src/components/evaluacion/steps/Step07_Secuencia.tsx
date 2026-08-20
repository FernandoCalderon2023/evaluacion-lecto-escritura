"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step07Secuencia({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle
        title="Ejercicio 7: Secuencia temporal"
        evalua="La organización temporal (antes/después) y el razonamiento secuencial de acciones: ordenar el tiempo, habilidad ligada a comprender y narrar en orden."
      />
      <BoolItems state={state} set={set} items={[
        { field: "ej7", label: "Responde correctamente qué hace primero", description: '"Yo juego después de hacer la tarea. ¿Qué haces primero?" → Respuesta: hacer la tarea' },
      ]} />
    </div>
  )
}
