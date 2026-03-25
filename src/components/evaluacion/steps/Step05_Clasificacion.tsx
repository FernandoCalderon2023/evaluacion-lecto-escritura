"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step05Clasificacion({ state, set }: Props) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Ejercicio 5: Clasificación y seguimiento de instrucciones" />
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">5A. Clasifica las imágenes correctamente</h3>
        <BoolItems state={state} set={set} items={[
          { field: "ej5aFrutas",   label: "Frutas en círculo", description: "Naranja y uvas → encierra en círculo" },
          { field: "ej5aAnimales", label: "Animales en cuadrado", description: "Pez y gallo → encierra en cuadrado" },
          { field: "ej5aDeportes", label: "Útiles deportivos subrayados", description: "Pelota de fútbol → subraya" },
        ]} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">5B. Instrucción día/noche con color</h3>
        <BoolItems state={state} set={set} items={[
          { field: "ej5b", label: "Marca correctamente según sea de día o noche", description: "Si es de noche: X roja en cuadro blanco. Si es de día: + verde encima del cuadro negro" },
        ]} />
      </div>
    </div>
  )
}
