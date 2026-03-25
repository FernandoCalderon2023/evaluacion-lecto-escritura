"use client"
import { ScaleValue } from "@/types/evaluacion"
import { cn } from "@/lib/utils"

const OPTIONS: { value: ScaleValue; label: string }[] = [
  { value: "S",  label: "Siempre" },
  { value: "CS", label: "Casi Siempre" },
  { value: "AV", label: "A Veces" },
  { value: "N",  label: "Nunca" },
]

interface Props {
  label: string
  value: ScaleValue
  onChange: (v: ScaleValue) => void
}

export function ScaleSelector({ label, value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex gap-1 flex-wrap">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
              value === o.value
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-slate-300 text-slate-600 hover:border-blue-400"
            )}
          >
            {o.value} — {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
