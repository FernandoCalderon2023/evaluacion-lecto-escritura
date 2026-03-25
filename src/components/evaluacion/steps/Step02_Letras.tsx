"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step02Letras({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Ejercicio 2: Completa las letras que faltan" subtitle="Marca los ítems que el estudiante respondió correctamente" />
      <BoolItems state={state} set={set} items={[
        { field: "ej2Bicicleta", label: "Bici__ __ __ ta → Bicicleta", description: "Completa con 'cle'" },
        { field: "ej2Mariposa",  label: "Mari __osa → Mariposa", description: "Completa con 'p'" },
        { field: "ej2Pez",       label: "p__ __ → Pez", description: "Completa con 'ez'" },
      ]} />
    </div>
  )
}
