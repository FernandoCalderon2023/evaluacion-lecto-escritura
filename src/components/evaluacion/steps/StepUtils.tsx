// Utilidad compartida para pasos con ítems booleanos
"use client"
import { CheckItem } from "@/components/shared/CheckItem"
import { EvaluacionFormData } from "@/types/evaluacion"

interface BoolItemsProps {
  items: Array<{ field: keyof EvaluacionFormData; label: string; description?: string }>
  state: Partial<EvaluacionFormData>
  set: (field: keyof EvaluacionFormData) => (v: unknown) => void
}

export function BoolItems({ items, state, set }: BoolItemsProps) {
  return (
    <div className="space-y-2">
      {items.map(({ field, label, description }) => (
        <CheckItem
          key={field}
          label={label}
          description={description}
          checked={!!state[field]}
          onChange={(v) => set(field)(v)}
        />
      ))}
    </div>
  )
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}
