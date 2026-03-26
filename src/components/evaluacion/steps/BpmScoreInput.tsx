"use client"

interface BpmScoreInputProps {
  label: string
  description?: string
  value: number | null | undefined
  onChange: (v: number | null) => void
}

const SCORE_OPTIONS = [
  { value: 1, label: "1", color: "bg-red-100 border-red-300 text-red-700", desc: "Débil" },
  { value: 2, label: "2", color: "bg-yellow-100 border-yellow-300 text-yellow-700", desc: "Satisfactorio" },
  { value: 3, label: "3", color: "bg-blue-100 border-blue-300 text-blue-700", desc: "Bueno" },
  { value: 4, label: "4", color: "bg-green-100 border-green-300 text-green-700", desc: "Excelente" },
]

export function BpmScoreInput({ label, description, value, onChange }: BpmScoreInputProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>
      <div className="flex gap-1 shrink-0">
        {SCORE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(value === opt.value ? null : opt.value)}
            className={`w-9 h-9 rounded-lg border text-sm font-bold transition-all ${
              value === opt.value
                ? `${opt.color} ring-2 ring-offset-1 ring-current`
                : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
            }`}
            title={opt.desc}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface BpmLateralityInputProps {
  label: string
  value: string | null | undefined
  onChange: (v: string | null) => void
}

export function BpmLateralityInput({ label, value, onChange }: BpmLateralityInputProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <p className="text-sm font-medium text-slate-700 flex-1">{label}</p>
      <div className="flex gap-2 shrink-0">
        {[
          { val: "I", label: "Izq", color: "bg-orange-100 border-orange-300 text-orange-700" },
          { val: "D", label: "Der", color: "bg-teal-100 border-teal-300 text-teal-700" },
        ].map((opt) => (
          <button
            key={opt.val}
            type="button"
            onClick={() => onChange(value === opt.val ? null : opt.val)}
            className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
              value === opt.val
                ? `${opt.color} ring-2 ring-offset-1 ring-current`
                : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
