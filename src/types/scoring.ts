import { EstadoAprendizaje } from "./evaluacion"

export interface LecturaResult {
  erroresPresentes: string[]
  erroresCount: number
  comprensionTotal: number
  comprensionMax: 15
  comprensionPct: number
  tipoLectura: string
  hasDifficulty: boolean
}

export interface CognitiveResult {
  totalCorrect: number
  totalItems: 27
  hasDifficulty: boolean
  byItem: {
    item3a: number; item3b: number; item4: number
    item5a: number; item5b: number; item6: number
    item7: number; item8: number; item9: number; item10: number
  }
}

export interface LexicalResult {
  totalCorrect: number
  totalItems: 17
  hasDifficulty: boolean
  byItem: {
    item11a: number; item11b: number
    item12: number; item13: number; item14: number
  }
}

export interface WritingResult {
  errorScore: number
  caligrafia: number
  coherencia: number
  produccion: number
  positiveTotal: number
  hasDifficulty: boolean
}

export interface AllScores {
  lectura: LecturaResult
  cognitivo: CognitiveResult
  lexical: LexicalResult
  dictado: WritingResult
  composicion: WritingResult
  estadoGeneral: EstadoAprendizaje
  areasDificultad: string[]
}
