"use client"
import { useState } from "react"
import { EvaluacionFormData } from "@/types/evaluacion"
import { SectionTitle } from "./StepUtils"
import { WritingRubric } from "./WritingRubric"
import { cn } from "@/lib/utils"

interface Props { state: Partial<EvaluacionFormData>; set: (f: keyof EvaluacionFormData) => (v: unknown) => void }

export function Step15Escritura({ state, set }: Props) {
  const [tab, setTab] = useState<"dict" | "comp">("dict")

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Ejercicios 15 y 16: Escritura"
        subtitle="Dictado y Composición libre — misma rúbrica de evaluación para ambos"
        evalua="La producción escrita por dos rutas: al dictado (correspondencia sonido-grafía, ortografía y caligrafía) y en composición libre (planificar, organizar ideas, coherencia y cohesión). Es la contraparte productiva de la lectura."
      />

      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>Revisión del psicopedagogo.</strong> El estudiante realiza el dictado y la composición. Mamá, papá o el responsable pueden acompañarlo según las indicaciones de aplicación, sin escribir ni corregir por él. Completa la rúbrica después de revisar su trabajo; los criterios sin valorar deben quedar en blanco.</p>
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setTab("dict")}
          className={cn(
            "flex-1 py-2 rounded-md text-sm font-semibold transition-all",
            tab === "dict" ? "bg-white text-viria-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Ej. 15 — Dictado
        </button>
        <button
          type="button"
          onClick={() => setTab("comp")}
          className={cn(
            "flex-1 py-2 rounded-md text-sm font-semibold transition-all",
            tab === "comp" ? "bg-white text-viria-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Ej. 16 — Composición
        </button>
      </div>

      {tab === "dict" ? (
        <WritingRubric prefix="dict" state={state} set={set} />
      ) : (
        <WritingRubric prefix="comp" state={state} set={set} />
      )}
    </div>
  )
}
