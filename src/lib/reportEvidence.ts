import type { AllScores } from "@/types/scoring"
import { COGNITIVE_THRESHOLD, LEXICAL_THRESHOLD, COMPRENSION_THRESHOLD_PCT, ERRORES_LECTURA_THRESHOLD } from "@/lib/scoring/constants"
export const REPORT_RULES_VERSION = "sideda-reglas-2026-10-22-v1"

export function reportEvidence(s: AllScores) {
 const writing = (area: string, w: AllScores["dictado"]) => ({ area, registro: w.registro, dato: `${w.itemsRespondidos}/${w.itemsEsperados} criterios registrados; calidad ${w.positiveTotal}/34; frecuencia de errores ${w.errorScore}/18`, alerta: w.hasDifficulty, regla: "Regla de la plataforma: calidad <17/34 o errores >9/18, con los 23 criterios registrados. Calidad y errores se interpretan por separado." })
 return [
  { area: "Lectura y comprensión", registro: s.lectura.registro, dato: `${s.lectura.comprensionTotal}/15 en comprensión; ${s.lectura.erroresCount} tipos de error marcados`, alerta: s.lectura.hasDifficulty, regla: `Regla de la plataforma: comprensión <${COMPRENSION_THRESHOLD_PCT}% o más de ${ERRORES_LECTURA_THRESHOLD} tipos de error. Requiere los cinco criterios de comprensión; no acredita que se haya registrado toda la lectura.` },
  { area: "Procesos cognitivos", registro: s.cognitivo.registro, dato: `${s.cognitivo.totalCorrect}/${s.cognitivo.totalItems} respuestas marcadas correctas`, alerta: s.cognitivo.hasDifficulty, regla: `Alerta con ≤${COGNITIVE_THRESHOLD} aciertos, únicamente si se confirmó la aplicación de los ejercicios 3–10.` },
  { area: "Procesos léxicos", registro: s.lexical.registro, dato: `${s.lexical.totalCorrect}/${s.lexical.totalItems} respuestas marcadas correctas`, alerta: s.lexical.hasDifficulty, regla: `Alerta con ≤${LEXICAL_THRESHOLD} aciertos, únicamente si se confirmó la aplicación de los ejercicios 11–14.` },
  writing("Escritura (dictado)",s.dictado), writing("Escritura (composición)",s.composicion),
 ].map(e => ({ ...e, dato: e.registro === "completo" ? e.dato : "Pendiente de completar o confirmar; no se interpreta como cero ni como dificultad." }))
}
