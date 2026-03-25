import { EstadoAprendizaje } from "@/types/evaluacion"
import { CheckCircle, AlertCircle, AlertTriangle, XCircle } from "lucide-react"

const CONFIG: Record<EstadoAprendizaje, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  "sin-dificultades":    { label: "Sin Dificultades",    color: "text-green-700",  bg: "bg-green-100 border-green-300",  icon: CheckCircle },
  "dificultad-leve":     { label: "Dificultad Leve",     color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-300", icon: AlertCircle },
  "dificultad-moderada": { label: "Dificultad Moderada", color: "text-orange-700", bg: "bg-orange-100 border-orange-300", icon: AlertTriangle },
  "dificultad-severa":   { label: "Dificultad Severa",   color: "text-red-700",    bg: "bg-red-100 border-red-300",      icon: XCircle },
}

interface Props { estado: EstadoAprendizaje; size?: "sm" | "lg" }

export function EstadoBadge({ estado, size = "sm" }: Props) {
  const cfg = CONFIG[estado]
  const Icon = cfg.icon
  if (size === "lg") {
    return (
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 ${cfg.bg} inline-flex`}>
        <Icon className={`h-6 w-6 ${cfg.color}`} />
        <div>
          <p className={`font-bold text-lg ${cfg.color}`}>{cfg.label}</p>
          <p className="text-xs text-slate-500">Estado general de aprendizaje</p>
        </div>
      </div>
    )
  }
  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="h-4 w-4" />
      {cfg.label}
    </span>
  )
}
