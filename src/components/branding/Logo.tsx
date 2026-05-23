import { cn } from "@/lib/utils"

interface LogoProps {
  /** Variante visual del logo */
  variant?: "default" | "white" | "mono"
  /** Tamaño del isotipo en píxeles */
  size?: number
  /** Mostrar texto a la derecha del isotipo */
  showText?: boolean
  /** Si showText=true, mostrar tagline pequeño */
  showTagline?: boolean
  className?: string
}

/**
 * Logo VirIA: isotipo de cerebro neuronal con gradient cyan→purple.
 * Tipografía: "Vir" sólido, "IA" con gradient.
 */
export function Logo({ variant = "default", size = 32, showText = true, showTagline = false, className }: LogoProps) {
  const iconColor = variant === "white" ? "#ffffff" : undefined
  const useGradient = variant === "default"

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Isotipo: cerebro de costado (vista lateral) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="viria-brain" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stopColor="#0FBFC9" />
            <stop offset="100%" stopColor="#058A9A" />
          </linearGradient>
        </defs>
        {(() => {
          const strokeColor = iconColor ?? "url(#viria-brain)"
          const fillColor = variant === "mono" ? "currentColor" : "none"
          return (
            <g
              stroke={strokeColor}
              fill={fillColor}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Silueta del cerebro vista de costado (frente a la izquierda) */}
              <path
                d="M 30 8
                   C 20 8, 12 14, 11 23
                   C 5 26, 5 34, 11 37
                   C 10 44, 15 50, 22 50
                   C 22 55, 28 57, 32 54
                   C 36 57, 42 55, 42 50
                   C 49 50, 54 45, 53 38
                   C 59 36, 59 28, 53 25
                   C 54 16, 46 9, 37 11
                   C 35 8, 32 8, 30 8 Z"
                strokeWidth="2"
              />
              {/* Surco central — pliegue principal del cerebro */}
              <path
                d="M 30 11 C 28 18, 34 24, 30 31 C 26 39, 36 44, 32 54"
                strokeWidth="1.4"
                opacity="0.85"
              />
              {/* Giro frontal */}
              <path
                d="M 17 22 C 21 23, 22 28, 19 32"
                strokeWidth="1.2"
                opacity="0.7"
              />
              {/* Giro parietal */}
              <path
                d="M 42 18 C 47 22, 44 28, 48 32"
                strokeWidth="1.2"
                opacity="0.7"
              />
              {/* Giro temporal */}
              <path
                d="M 15 40 C 19 41, 22 44, 21 48"
                strokeWidth="1.2"
                opacity="0.7"
              />
              {/* Cerebelo */}
              <path
                d="M 40 50 C 44 54, 50 52, 50 47 C 52 44, 48 42, 44 44"
                strokeWidth="1.5"
              />
              {/* Tallo cerebral */}
              <path
                d="M 34 56 L 34 60 M 38 56 L 38 60"
                strokeWidth="1.5"
              />
              {/* Acentos neuronales sutiles */}
              <circle cx="22" cy="18" r="1.3" fill={iconColor ?? "#0FBFC9"} stroke="none" />
              <circle cx="46" cy="26" r="1.3" fill={iconColor ?? "#058A9A"} stroke="none" />
              <circle cx="26" cy="44" r="1.3" fill={iconColor ?? "#0FBFC9"} stroke="none" />
            </g>
          )
        })()}
      </svg>

      {/* Texto */}
      {showText && (
        <div className="leading-tight">
          <div className="flex items-baseline gap-0">
            <span
              className={cn(
                "font-extrabold tracking-tight",
                variant === "white" ? "text-white" :
                variant === "mono" ? "text-current" : "text-slate-700"
              )}
              style={{ fontSize: size * 0.72 }}
            >
              Vir
            </span>
            <span
              className={cn(
                "font-extrabold tracking-tight",
                useGradient
                  ? "bg-clip-text text-transparent bg-ia-gradient"
                  : variant === "white" ? "text-white" : "text-current"
              )}
              style={{ fontSize: size * 0.72 }}
            >
              IA
            </span>
          </div>
          {showTagline && (
            <p
              className={cn(
                "font-medium tracking-wide",
                variant === "white" ? "text-viria-200" :
                variant === "mono" ? "text-current opacity-70" : "text-viria-700"
              )}
              style={{ fontSize: size * 0.28, marginTop: -2 }}
            >
              Evaluación Inteligente
            </p>
          )}
        </div>
      )}
    </div>
  )
}
