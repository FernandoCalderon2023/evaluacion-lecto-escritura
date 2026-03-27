"use client"
import { PositionValue } from "@/types/evaluacion"
import { cn } from "@/lib/utils"

const OPTIONS: { value: PositionValue; label: string }[] = [
  { value: "I", label: "Inicio" },
  { value: "M", label: "Medio" },
  { value: "F", label: "Final" },
  { value: "N", label: "No presenta" },
]

interface Props {
  label: string
  value: PositionValue | "" | null | undefined
  onChange: (v: PositionValue | "") => void
}

export function PositionSelector({ label, value, onChange }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <div className="flex gap-1.5 flex-wrap">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(value === o.value ? "" : o.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all",
              value === o.value && o.value !== "N"
                ? "bg-orange-500 border-orange-500 text-white shadow-md"
                : value === o.value && o.value === "N"
                ? "bg-green-600 border-green-600 text-white shadow-md"
                : "bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
            )}
          >
            {o.label}
          </button>
        ))}
        {value && String(value) !== "" && value !== "N" && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-2 py-2 rounded-lg text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Dejar en blanco"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
