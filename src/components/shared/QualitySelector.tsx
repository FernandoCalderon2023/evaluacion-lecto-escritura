"use client"
import { QualityValue } from "@/types/evaluacion"
import { cn } from "@/lib/utils"

const OPTIONS: { value: QualityValue; label: string; color: string }[] = [
  { value: "B", label: "Bien",    color: "bg-green-600 border-green-600 text-white" },
  { value: "R", label: "Regular", color: "bg-yellow-500 border-yellow-500 text-white" },
  { value: "M", label: "Mejorar", color: "bg-red-500 border-red-500 text-white" },
]

interface Props {
  label: string
  value: QualityValue
  onChange: (v: QualityValue) => void
}

export function QualitySelector({ label, value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
              value === o.value
                ? o.color
                : "bg-white border-slate-300 text-slate-600 hover:border-slate-400"
            )}
          >
            {o.value} — {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
