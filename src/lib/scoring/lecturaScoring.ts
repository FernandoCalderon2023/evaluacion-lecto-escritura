import { EvaluacionFormData, ScaleValue } from "@/types/evaluacion"
import { LecturaResult } from "@/types/scoring"
import { SCALE_VALUE, COMPRENSION_THRESHOLD_PCT, ERRORES_LECTURA_THRESHOLD } from "./constants"

const NOMBRE_ERROR: Record<string, string> = {
  errorCambioLetras: "Cambio de letras",
  errorCambioSilabas: "Cambio de sílabas",
  errorCambioPalabras: "Cambio de palabras",
  errorOmision: "Omisión de sonidos",
  errorAdicion: "Adición de sonidos",
  errorRepeticion: "Repeticiones",
  errorRotacion: "Rotaciones (b↔d, p↔q)",
  errorInversion: "Inversiones (el↔le)",
}

export function scoreLectura(ev: Partial<EvaluacionFormData>): LecturaResult {
  const errorFields = [
    "errorCambioLetras", "errorCambioSilabas", "errorCambioPalabras",
    "errorOmision", "errorAdicion", "errorRepeticion", "errorRotacion", "errorInversion",
  ] as const

  const erroresPresentes: string[] = []
  for (const field of errorFields) {
    const val = ev[field as keyof EvaluacionFormData] as string
    if (val && val !== "N") {
      erroresPresentes.push(NOMBRE_ERROR[field])
    }
  }

  const compFields: (keyof EvaluacionFormData)[] = [
    "compMemoriza", "compIdeas", "compValora", "compInterpreta", "compAsocia",
  ]
  const comprensionTotal = compFields.reduce((sum, f) => {
    const val = ev[f] as ScaleValue
    return sum + (SCALE_VALUE[val] ?? 0)
  }, 0)

  const comprensionPct = (comprensionTotal / 15) * 100

  const tipoLectura =
    (ev.lecturaCorriente === "S" || ev.lecturaCorriente === "CS")
      ? "Corriente"
      : ev.lecturaSilabica === "S" || ev.lecturaSilabica === "CS"
      ? "Silábica"
      : "Vacilante"

  return {
    erroresPresentes,
    erroresCount: erroresPresentes.length,
    comprensionTotal,
    comprensionMax: 15,
    comprensionPct,
    tipoLectura,
    hasDifficulty:
      comprensionPct < COMPRENSION_THRESHOLD_PCT ||
      erroresPresentes.length > ERRORES_LECTURA_THRESHOLD,
  }
}
