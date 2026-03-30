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
      />

      <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setTab("dict")}
          className={cn(
            "flex-1 py-2 rounded-md text-sm font-semibold transition-all",
            tab === "dict" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Ej. 15 — Dictado
        </button>
        <button
          type="button"
          onClick={() => setTab("comp")}
          className={cn(
            "flex-1 py-2 rounded-md text-sm font-semibold transition-all",
            tab === "comp" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
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
