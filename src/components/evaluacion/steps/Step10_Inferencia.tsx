"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step10Inferencia({ state, set }: Props) {
  return (
    <div className="space-y-4">
      <SectionTitle helpStep={10}
        title="Ejercicio 10: Inferencia"
        subtitle="El estudiante debe inferir la respuesta a partir de la situación"
        evalua="La comprensión inferencial: deducir información que no está dicha explícitamente a partir de la situación. Es el nivel de comprensión que va más allá de lo literal."
      />
      <BoolItems state={state} set={set} items={[
        { field: "ej10a", label: "a) El niño tomó leche y se quemó. ¿Cómo estaba la leche?", description: "Respuesta: caliente / muy caliente" },
        { field: "ej10b", label: "b) Tomaste agua y se te enfriaron los labios. ¿Cómo estaba el agua?", description: "Respuesta: fría / muy fría" },
        { field: "ej10c", label: "c) Jorge ayuda a su mamá. ¿Cómo es Jorge?", description: "Respuesta: bueno / responsable / amable" },
      ]} />
      <label className="flex items-start gap-3 rounded-xl border border-viria-300 bg-viria-50 p-4 text-sm"><input type="checkbox" checked={state.cognitivoAplicado === true} onChange={e => set("cognitivoAplicado")(e.target.checked)} className="mt-1"/><span><strong>Confirmo que apliqué y registré todos los ejercicios cognitivos (3 al 10).</strong> Solo después de confirmar, las casillas sin marcar se interpretan como respuestas incorrectas. Si falta aplicar alguno, deja esta confirmación desmarcada.</span></label>
    </div>
  )
}
