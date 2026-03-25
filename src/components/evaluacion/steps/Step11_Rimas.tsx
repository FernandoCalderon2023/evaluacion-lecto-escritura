"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { BoolItems, SectionTitle } from "./StepUtils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step11Rimas({ state, set }: Props) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Ejercicio 11: Procesos Léxicos — Rima" />
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">11A. Escribe una palabra que rime con:</h3>
        <BoolItems state={state} set={set} items={[
          { field: "ej11a1", label: "1. oca → rima válida (boca, loca, poca, toca...)" },
          { field: "ej11a2", label: "2. tetera → rima válida (madera, esfera, espera...)" },
          { field: "ej11a3", label: "3. Ada → rima válida (nada, espada, helada...)" },
          { field: "ej11a4", label: "4. teja → rima válida (vieja, oreja, abeja...)" },
        ]} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">11B. ¿Cuál es la palabra que NO rima? Márcala</h3>
        <BoolItems state={state} set={set} items={[
          { field: "ej11b1", label: "1. sal, mar, cal → NO rima: mar", description: "sal/cal riman, mar no" },
          { field: "ej11b2", label: "2. mitad, ciudad, cantar → NO rima: cantar", description: "mitad/ciudad riman, cantar no" },
          { field: "ej11b3", label: "3. maíz, raíz, rosal → NO rima: rosal", description: "maíz/raíz riman, rosal no" },
          { field: "ej11b4", label: "4. cantar, saltar, baila → NO rima: baila", description: "cantar/saltar riman, baila no" },
        ]} />
      </div>
    </div>
  )
}
