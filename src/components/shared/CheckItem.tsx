"use client"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle } from "lucide-react"

interface Props {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
}

export function CheckItem({ label, checked, onChange, description }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-start gap-3 w-full text-left p-3 rounded-lg border transition-colors",
        checked
          ? "bg-green-50 border-green-400 text-green-800"
          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
      )}
    >
      {checked ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
      )}
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </button>
  )
}
