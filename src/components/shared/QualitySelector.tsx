"use client"
import { QualityValue } from "@/types/evaluacion"
import { CriterionHelp } from "@/components/evaluacion/help/EvaluatorHelp"
import { HelpKey } from "@/components/evaluacion/help/content"
import { cn } from "@/lib/utils"

const OPTIONS: { value: QualityValue; label: string; color: string }[] = [
  { value: "B", label: "Bien",    color: "bg-green-600 border-green-600 text-white shadow-md" },
  { value: "R", label: "Regular", color: "bg-yellow-500 border-yellow-500 text-white shadow-md" },
  { value: "M", label: "Mejorar", color: "bg-red-500 border-red-500 text-white shadow-md" },
]

interface Props {
  helpKey?: HelpKey
  label: string
  value: QualityValue
  onChange: (v: QualityValue) => void
}

export function QualitySelector({ label, value, onChange, helpKey }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      {helpKey && <CriterionHelp helpKey={helpKey} label={label}/>}
      <div role="group" aria-label={label} className="flex gap-1.5 flex-wrap">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(value === o.value ? "" : o.value)}
            className={cn(
              "min-h-11 px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all",
              value === o.value
                ? o.color
                : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            )}
          >
            {o.value} — {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
