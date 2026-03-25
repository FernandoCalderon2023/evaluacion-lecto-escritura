import { EvaluacionFormData, ScaleValue, QualityValue } from "@/types/evaluacion"
import { WritingResult } from "@/types/scoring"
import { SCALE_VALUE, QUALITY_VALUE } from "./constants"

type Prefix = "dict" | "comp"

function getField<T>(ev: Partial<EvaluacionFormData>, prefix: Prefix, suffix: string): T {
  const key = `${prefix}_${suffix}` as keyof EvaluacionFormData
  return ev[key] as T
}

export function scoreWriting(ev: Partial<EvaluacionFormData>, prefix: Prefix): WritingResult {
  const sv = (suffix: string) =>
    SCALE_VALUE[getField<ScaleValue>(ev, prefix, suffix)] ?? 0
  const qv = (suffix: string) =>
    QUALITY_VALUE[getField<QualityValue>(ev, prefix, suffix)] ?? 0

  // Errores (mayor puntaje = más errores = peor)
  const errorScore =
    sv("invierte") + sv("confOrden") + sv("omite") +
    sv("agrega") + sv("dificConectar") + sv("espejo")  // max 18

  // Positivos (mayor = mejor)
  const caligrafia = qv("caligUnif") + qv("caligCoord") + qv("caligLimp")  // max 6
  const coherencia =
    qv("cohConcord") + qv("cohSecuencia") + qv("cohEnlace") +
    qv("cohTema") + qv("cohEstructura")  // max 10
  const produccion =
    qv("prodPresent") + qv("prodExtension") + qv("prodOrden") +
    qv("prodIdeas") + qv("prodTitulo") + qv("prodComas") +
    qv("prodPuntuacion") + qv("prodInterAdm") + qv("prodMayusc")  // max 18

  const positiveTotal = caligrafia + coherencia + produccion  // max 34

  return {
    errorScore,
    caligrafia,
    coherencia,
    produccion,
    positiveTotal,
    hasDifficulty: positiveTotal < 17 || errorScore > 9,
  }
}
