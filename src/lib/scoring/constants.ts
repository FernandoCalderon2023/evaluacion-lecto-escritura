import { ScaleValue, QualityValue } from "@/types/evaluacion"

export const SCALE_VALUE: Record<ScaleValue, number> = {
  S: 3, CS: 2, AV: 1, N: 0, "": 0,
}

export const QUALITY_VALUE: Record<QualityValue, number> = {
  B: 2, R: 1, M: 0, "": 0,
}

// Umbrales oficiales del instrumento (Ministerio de Educación Bolivia, 2012)
export const COGNITIVE_THRESHOLD = 15   // >15 = sin dificultad
export const LEXICAL_THRESHOLD = 8      // >8 = sin dificultad

// Heurística plataforma para lectura
export const COMPRENSION_THRESHOLD_PCT = 50  // <50% = dificultad
export const ERRORES_LECTURA_THRESHOLD = 4   // >4 tipos = dificultad
