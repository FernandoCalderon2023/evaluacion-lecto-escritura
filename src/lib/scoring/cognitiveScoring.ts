import { EvaluacionFormData } from "@/types/evaluacion"
import { CognitiveResult } from "@/types/scoring"
import { COGNITIVE_THRESHOLD } from "./constants"

export function scoreCognitive(ev: Partial<EvaluacionFormData>): CognitiveResult {
  const b = (v: boolean | undefined) => (v ? 1 : 0)

  const item3a = b(ev.ej3a1) + b(ev.ej3a2) + b(ev.ej3a3)           // max 3
  const item3b = b(ev.ej3b1) + b(ev.ej3b2) + b(ev.ej3b3)           // max 3
  const item4  = b(ev.ej4a) + b(ev.ej4b)                            // max 2
  const item5a = b(ev.ej5aFrutas) + b(ev.ej5aAnimales) + b(ev.ej5aDeportes) // max 3
  const item5b = b(ev.ej5b)                                          // max 1
  const item6  = b(ev.ej6a) + b(ev.ej6b) + b(ev.ej6c)              // max 3
  const item7  = b(ev.ej7)                                           // max 1
  const item8  = b(ev.ej8a) + b(ev.ej8b) + b(ev.ej8c) + b(ev.ej8d) // max 4
  const item9  = b(ev.ej9a) + b(ev.ej9b) + b(ev.ej9c) + b(ev.ej9d) // max 4
  const item10 = b(ev.ej10a) + b(ev.ej10b) + b(ev.ej10c)           // max 3

  // Total máximo bloque 3-10: 3+3+2+3+1+3+1+4+4+3 = 27 sub-ítems
  // Umbral oficial (Instrumento 2012): >15 aciertos = sin dificultad
  const totalCorrect = item3a + item3b + item4 + item5a + item5b + item6 + item7 + item8 + item9 + item10

  return {
    totalCorrect,
    totalItems: 27,
    hasDifficulty: totalCorrect <= COGNITIVE_THRESHOLD, // <=15 = dificultad (instrumento: >15 = sin dificultad)
    byItem: { item3a, item3b, item4, item5a, item5b, item6, item7, item8, item9, item10 },
  }
}
