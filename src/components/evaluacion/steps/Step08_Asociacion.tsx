"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step08Asociacion({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Ejercicio 8: Asociación verbo-objeto/animal" subtitle="Palabras disponibles: Vuela, salta, canta, se arrastra, cortar papeles, dibujar, juega, pintar" />
      <BoolItems state={state} set={set} items={[
        { field: "ej8a", label: "a) Las tijeras sirven para...", description: "Respuesta esperada: cortar papeles" },
        { field: "ej8b", label: "b) El perro...", description: "Respuesta esperada: salta o juega" },
        { field: "ej8c", label: "c) El pájaro...", description: "Respuesta esperada: vuela o canta" },
        { field: "ej8d", label: "d) El lagarto...", description: "Respuesta esperada: se arrastra" },
      ]} />
    </div>
  )
}
