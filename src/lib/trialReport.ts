import type { AllScores, EstadoRegistro } from "@/types/scoring"
export function trialReportAreas(scores: AllScores) {
  const area = (name: string, registro: EstadoRegistro, result: string, next: string) => ({ name, registro, result: registro === "completo" ? result : "Pendiente de completar", next })
  return [
    area("Lectura y comprensión", scores.lectura.registro, `Comprensión: ${scores.lectura.comprensionTotal} / 15`, "Completa los criterios de lectura y comprensión; registra solo lo observado."),
    area("Procesos cognitivos", scores.cognitivo.registro, `${scores.cognitivo.totalCorrect} / 27 aciertos`, "Revisa los ejercicios 3–10 y confirma su aplicación en el apartado de Inferencia."),
    area("Procesos léxicos", scores.lexical.registro, `${scores.lexical.totalCorrect} / 17 aciertos`, "Revisa los ejercicios 11–14 y confirma su aplicación en Inversión."),
    area("Escritura: dictado", scores.dictado.registro, `Calidad: ${scores.dictado.positiveTotal} / 34 · Errores: ${scores.dictado.errorScore} / 18`, "Pide al psicopedagogo revisar la muestra de dictado y completar los criterios observados."),
    area("Escritura: composición", scores.composicion.registro, `Calidad: ${scores.composicion.positiveTotal} / 34 · Errores: ${scores.composicion.errorScore} / 18`, "Pide al psicopedagogo revisar la composición. Lo que no pueda valorar queda pendiente."),
  ]
}
