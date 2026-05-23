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
      {/* Isotipo: cerebro neural */}
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
        {/* Silueta cerebro estilizada con nodos */}
        <path
          d="M22 14c-5 0-9 4-9 9 0 2 .5 4 1.5 5.5C13 30 12 32 12 35c0 3 1.5 5.5 4 7-.5 1.5-.5 3 0 4.5 1 3 4 5 7.5 5 1 0 2-.2 3-.6.8 1.6 2.5 2.6 4.5 2.6s3.7-1 4.5-2.6c1 .4 2 .6 3 .6 3.5 0 6.5-2 7.5-5 .5-1.5.5-3 0-4.5 2.5-1.5 4-4 4-7 0-3-1-5-2.5-6.5C49.5 27 50 25 50 23c0-5-4-9-9-9-2 0-3.8.7-5.3 1.8C34.5 14.6 33.3 14 32 14s-2.5.6-3.7 1.8C26.8 14.7 25 14 22 14z"
          stroke={iconColor ?? "url(#viria-brain)"}
          strokeWidth="1.5"
          fill={variant === "mono" ? "currentColor" : "none"}
        />
        {/* Nodos de red neuronal */}
        <circle cx="20" cy="24" r="2" fill={iconColor ?? "#0FBFC9"} />
        <circle cx="32" cy="20" r="2" fill={iconColor ?? "#0FBFC9"} />
        <circle cx="44" cy="24" r="2" fill={iconColor ?? "#0FBFC9"} />
        <circle cx="20" cy="38" r="2" fill={iconColor ?? "#058A9A"} />
        <circle cx="32" cy="34" r="2.5" fill={iconColor ?? "#058A9A"} />
        <circle cx="44" cy="38" r="2" fill={iconColor ?? "#058A9A"} />
        <circle cx="26" cy="48" r="2" fill={iconColor ?? "#0FBFC9"} />
        <circle cx="38" cy="48" r="2" fill={iconColor ?? "#0FBFC9"} />
        {/* Conexiones entre nodos */}
        <g stroke={iconColor ?? "#0FBFC9"} strokeWidth="0.8" opacity="0.6">
          <line x1="20" y1="24" x2="32" y2="20" />
          <line x1="32" y1="20" x2="44" y2="24" />
          <line x1="20" y1="24" x2="32" y2="34" />
          <line x1="32" y1="34" x2="44" y2="24" />
          <line x1="20" y1="38" x2="32" y2="34" />
          <line x1="32" y1="34" x2="44" y2="38" />
          <line x1="20" y1="38" x2="26" y2="48" />
          <line x1="44" y1="38" x2="38" y2="48" />
          <line x1="26" y1="48" x2="38" y2="48" />
        </g>
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
