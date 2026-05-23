import Image from "next/image"
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

const ISOTYPE_SRC: Record<NonNullable<LogoProps["variant"]>, string> = {
  default: "/brand/viria-brain-square.png",
  white: "/brand/viria-brain-white.png",
  mono: "/brand/viria-brain-mono.png",
}

/**
 * Logo VirIA: cerebro neural con gradient cyan→teal.
 * Tipografía: "Vir" sólido, "IA" con gradient (variant=default).
 */
export function Logo({
  variant = "default",
  size = 32,
  showText = true,
  showTagline = false,
  className,
}: LogoProps) {
  const useGradientText = variant === "default"

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={ISOTYPE_SRC[variant]}
        alt="VirIA"
        width={size}
        height={size}
        priority
        className="shrink-0 select-none"
        style={{ width: size, height: size }}
      />

      {showText && (
        <div className="leading-tight">
          <div className="flex items-baseline gap-0">
            <span
              className={cn(
                "font-extrabold tracking-tight",
                variant === "white"
                  ? "text-white"
                  : variant === "mono"
                    ? "text-current"
                    : "text-slate-700"
              )}
              style={{ fontSize: size * 0.72 }}
            >
              Vir
            </span>
            <span
              className={cn(
                "font-extrabold tracking-tight",
                useGradientText
                  ? "bg-clip-text text-transparent bg-ia-gradient"
                  : variant === "white"
                    ? "text-white"
                    : "text-current"
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
                variant === "white"
                  ? "text-viria-200"
                  : variant === "mono"
                    ? "text-current opacity-70"
                    : "text-viria-700"
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
