import { EvaluacionFormData, EstadoAprendizaje } from "@/types/evaluacion"
import { AllScores } from "@/types/scoring"
import { scoreLectura } from "./lecturaScoring"
import { scoreCognitive } from "./cognitiveScoring"
import { scoreLexical } from "./lexicalScoring"
import { scoreWriting } from "./writingScoring"

export function calcularScores(ev: Partial<EvaluacionFormData>): AllScores {
  const lectura    = scoreLectura(ev)
  const cognitivo  = scoreCognitive(ev)
  const lexical    = scoreLexical(ev)
  const dictado    = scoreWriting(ev, "dict")
  const composicion = scoreWriting(ev, "comp")

  const areasDificultad: string[] = []
  if (lectura.hasDifficulty)    areasDificultad.push("Lectura y Comprensión")
  if (cognitivo.hasDifficulty)  areasDificultad.push("Procesos Cognitivos")
  if (lexical.hasDifficulty)    areasDificultad.push("Procesos Léxicos")
  if (dictado.hasDifficulty)    areasDificultad.push("Escritura (Dictado)")
  if (composicion.hasDifficulty) areasDificultad.push("Escritura (Composición)")

  const count = areasDificultad.length
  let estadoGeneral: EstadoAprendizaje
  if (count === 0)      estadoGeneral = "sin-dificultades"
  else if (count === 1) estadoGeneral = "dificultad-leve"
  else if (count <= 3)  estadoGeneral = "dificultad-moderada"
  else                  estadoGeneral = "dificultad-severa"

  return { lectura, cognitivo, lexical, dictado, composicion, estadoGeneral, areasDificultad }
}

export { scoreLectura, scoreCognitive, scoreLexical, scoreWriting }
