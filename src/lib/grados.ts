/**
 * Grados y niveles del sistema educativo boliviano, mapeados al "año de
 * escolaridad continuo" (1–12) que usa el motor de currículo:
 *   - 1–6  = 1º a 6º de PRIMARIA
 *   - 7–12 = 1º a 6º de SECUNDARIA
 * Ver también `@/lib/ai/curriculo`, que usa la misma numeración.
 */
export type Nivel = "Primaria" | "Secundaria"

export interface GradoOption {
  /** Año de escolaridad continuo (1–12). */
  anio: number
  nivel: Nivel
  /** Grado dentro del nivel (1–6). */
  grado: number
  /** Etiqueta canónica: "3º de Primaria". */
  gradoLabel: string
  /** Etiqueta para el selector de año: "3° año — 3º de Primaria". */
  anioLabel: string
}

export const NIVELES: Nivel[] = ["Primaria", "Secundaria"]
export const GRADOS_POR_NIVEL = [1, 2, 3, 4, 5, 6]

/** Año continuo (1–12) a partir de nivel + grado (1–6). */
export function anioFromNivelGrado(nivel: Nivel, grado: number): number {
  return nivel === "Secundaria" ? 6 + grado : grado
}

/** Etiqueta canónica de grado: "3º de Primaria". */
export function gradoLabel(nivel: Nivel, grado: number): string {
  return `${grado}º de ${nivel}`
}

function build(): GradoOption[] {
  const out: GradoOption[] = []
  for (const nivel of NIVELES) {
    for (const grado of GRADOS_POR_NIVEL) {
      const anio = anioFromNivelGrado(nivel, grado)
      out.push({ anio, nivel, grado, gradoLabel: gradoLabel(nivel, grado), anioLabel: `${anio}° año — ${gradoLabel(nivel, grado)}` })
    }
  }
  return out
}

/** Los 12 grados (primaria 1–6 + secundaria 1–6), ordenados por año. */
export const GRADOS: GradoOption[] = build()

/**
 * Intenta derivar el año escolar (1–12) desde una etiqueta de grado libre.
 * Tolera formatos viejos ("3ro Primaria", "2do de secundaria", "3º de Primaria").
 * Devuelve null si no puede interpretarla.
 */
export function anioFromGradoLabel(grado?: string | null): number | null {
  if (!grado) return null
  const m = grado.match(/(\d+)\s*(?:º|°|ro|do|to|mo|vo|er|ª)?\s*(?:de\s+)?(prim|sec)/i)
  if (!m) return null
  const g = parseInt(m[1], 10)
  if (g < 1 || g > 6) return null
  return m[2].toLowerCase().startsWith("sec") ? 6 + g : g
}
