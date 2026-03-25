"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step03Objetos({ state, set }: Props) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Ejercicio 3: Objetos" />
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">3A. Nombra correctamente cada objeto</h3>
        <BoolItems state={state} set={set} items={[
          { field: "ej3a1", label: "Imagen 1: Escritorio" },
          { field: "ej3a2", label: "Imagen 2: Caballo" },
          { field: "ej3a3", label: "Imagen 3: Zapatos / Zapatillas" },
        ]} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">3B. Explica para qué sirve cada objeto</h3>
        <BoolItems state={state} set={set} items={[
          { field: "ej3b1", label: "Explicación del objeto 1 (escritorio)" },
          { field: "ej3b2", label: "Explicación del objeto 2 (caballo)" },
          { field: "ej3b3", label: "Explicación del objeto 3 (zapatos)" },
        ]} />
      </div>
    </div>
  )
}
