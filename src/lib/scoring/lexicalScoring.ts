import { EvaluacionFormData } from "@/types/evaluacion"
import { LexicalResult } from "@/types/scoring"
import { LEXICAL_THRESHOLD } from "./constants"

export function scoreLexical(ev: Partial<EvaluacionFormData>): LexicalResult {
  const b = (v: boolean | undefined) => (v ? 1 : 0)

  const item11a = b(ev.ej11a1) + b(ev.ej11a2) + b(ev.ej11a3) + b(ev.ej11a4)  // max 4
  const item11b = b(ev.ej11b1) + b(ev.ej11b2) + b(ev.ej11b3) + b(ev.ej11b4)  // max 4
  const item12  = b(ev.ej12a) + b(ev.ej12b) + b(ev.ej12c)                     // max 3
  const item13  = b(ev.ej13a) + b(ev.ej13b) + b(ev.ej13c)                     // max 3
  const item14  = b(ev.ej14a) + b(ev.ej14b) + b(ev.ej14c)                     // max 3

  const totalCorrect = item11a + item11b + item12 + item13 + item14  // max 17

  return {
    totalCorrect,
    totalItems: 17,
    hasDifficulty: totalCorrect <= LEXICAL_THRESHOLD,
    byItem: { item11a, item11b, item12, item13, item14 },
  }
}
