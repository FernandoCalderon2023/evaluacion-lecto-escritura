"use client"
import { ScaleValue } from "@/types/evaluacion"
import { cn } from "@/lib/utils"

const OPTIONS: { value: ScaleValue; label: string; short: string }[] = [
  { value: "S",  label: "Siempre",      short: "S" },
  { value: "CS", label: "Casi Siempre", short: "CS" },
  { value: "AV", label: "A Veces",      short: "AV" },
  { value: "N",  label: "Nunca",        short: "N" },
]

interface Props {
  label: string
  value: ScaleValue | "" | null | undefined
  onChange: (v: ScaleValue | "") => void
}

export function ScaleSelector({ label, value, onChange }: Props) {
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
              value === o.value
                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50"
            )}
          >
            {o.short} — {o.label}
          </button>
        ))}
        {value && String(value) !== "" && (
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
