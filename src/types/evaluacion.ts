export type ScaleValue = "S" | "CS" | "AV" | "N"
export type QualityValue = "B" | "R" | "M"
export type PositionValue = "I" | "M" | "F" | "N"
export type TonoVoz = "grave" | "agudo" | "medio"
export type EstadoAprendizaje =
  | "sin-dificultades"
  | "dificultad-leve"
  | "dificultad-moderada"
  | "dificultad-severa"

export interface EvaluacionFormData {
  estudianteId: string
  evaluador: string
  fecha: string
  edadAlEvaluar: number | null
  anioEscolar: number | null

  // Ejercicio 1
  tonoVoz: TonoVoz
  expresionMatices: number
  respetaSignosPunt: ScaleValue
  lecturaVacilante: ScaleValue
  lecturaSilabica: ScaleValue
  lecturaCorriente: ScaleValue
  errorCambioLetras: PositionValue
  errorCambioSilabas: PositionValue
  errorCambioPalabras: PositionValue
  errorOmision: PositionValue
  errorAdicion: PositionValue
  errorRepeticion: PositionValue
  errorRotacion: PositionValue
  errorInversion: PositionValue
  compMemoriza: ScaleValue
  compIdeas: ScaleValue
  compValora: ScaleValue
  compInterpreta: ScaleValue
  compAsocia: ScaleValue

  // Ejercicios 2-14
  ej2Bicicleta: boolean
  ej2Mariposa: boolean
  ej2Pez: boolean
  ej3a1: boolean; ej3a2: boolean; ej3a3: boolean
  ej3b1: boolean; ej3b2: boolean; ej3b3: boolean
  ej4a: boolean; ej4b: boolean
  ej5aFrutas: boolean; ej5aAnimales: boolean; ej5aDeportes: boolean
  ej5b: boolean
  ej6a: boolean; ej6b: boolean; ej6c: boolean
  ej7: boolean
  ej8a: boolean; ej8b: boolean; ej8c: boolean; ej8d: boolean
  ej9a: boolean; ej9b: boolean; ej9c: boolean; ej9d: boolean
  ej10a: boolean; ej10b: boolean; ej10c: boolean
  ej11a1: boolean; ej11a2: boolean; ej11a3: boolean; ej11a4: boolean
  ej11b1: boolean; ej11b2: boolean; ej11b3: boolean; ej11b4: boolean
  ej12a: boolean; ej12b: boolean; ej12c: boolean
  ej13a: boolean; ej13b: boolean; ej13c: boolean
  ej14a: boolean; ej14b: boolean; ej14c: boolean

  // Dictado (ej15)
  dict_invierte: ScaleValue; dict_confOrden: ScaleValue
  dict_omite: ScaleValue; dict_agrega: ScaleValue
  dict_dificConectar: ScaleValue; dict_espejo: ScaleValue
  dict_caligUnif: QualityValue; dict_caligCoord: QualityValue; dict_caligLimp: QualityValue
  dict_cohConcord: QualityValue; dict_cohSecuencia: QualityValue
  dict_cohEnlace: QualityValue; dict_cohTema: QualityValue; dict_cohEstructura: QualityValue
  dict_prodPresent: QualityValue; dict_prodExtension: QualityValue
  dict_prodOrden: QualityValue; dict_prodIdeas: QualityValue; dict_prodTitulo: QualityValue
  dict_prodComas: QualityValue; dict_prodPuntuacion: QualityValue
  dict_prodInterAdm: QualityValue; dict_prodMayusc: QualityValue

  // Composición (ej16)
  comp_invierte: ScaleValue; comp_confOrden: ScaleValue
  comp_omite: ScaleValue; comp_agrega: ScaleValue
  comp_dificConectar: ScaleValue; comp_espejo: ScaleValue
  comp_caligUnif: QualityValue; comp_caligCoord: QualityValue; comp_caligLimp: QualityValue
  comp_cohConcord: QualityValue; comp_cohSecuencia: QualityValue
  comp_cohEnlace: QualityValue; comp_cohTema: QualityValue; comp_cohEstructura: QualityValue
  comp_prodPresent: QualityValue; comp_prodExtension: QualityValue
  comp_prodOrden: QualityValue; comp_prodIdeas: QualityValue; comp_prodTitulo: QualityValue
  comp_prodComas: QualityValue; comp_prodPuntuacion: QualityValue
  comp_prodInterAdm: QualityValue; comp_prodMayusc: QualityValue
}

export const EVALUACION_DEFAULTS: Omit<EvaluacionFormData, "estudianteId" | "evaluador" | "fecha"> = {
  edadAlEvaluar: null,
  anioEscolar: null,
  tonoVoz: "medio", expresionMatices: 2,
  respetaSignosPunt: "AV", lecturaVacilante: "AV", lecturaSilabica: "AV", lecturaCorriente: "AV",
  errorCambioLetras: "N", errorCambioSilabas: "N", errorCambioPalabras: "N",
  errorOmision: "N", errorAdicion: "N", errorRepeticion: "N", errorRotacion: "N", errorInversion: "N",
  compMemoriza: "AV", compIdeas: "AV", compValora: "AV", compInterpreta: "AV", compAsocia: "AV",
  ej2Bicicleta: false, ej2Mariposa: false, ej2Pez: false,
  ej3a1: false, ej3a2: false, ej3a3: false,
  ej3b1: false, ej3b2: false, ej3b3: false,
  ej4a: false, ej4b: false,
  ej5aFrutas: false, ej5aAnimales: false, ej5aDeportes: false, ej5b: false,
  ej6a: false, ej6b: false, ej6c: false,
  ej7: false,
  ej8a: false, ej8b: false, ej8c: false, ej8d: false,
  ej9a: false, ej9b: false, ej9c: false, ej9d: false,
  ej10a: false, ej10b: false, ej10c: false,
  ej11a1: false, ej11a2: false, ej11a3: false, ej11a4: false,
  ej11b1: false, ej11b2: false, ej11b3: false, ej11b4: false,
  ej12a: false, ej12b: false, ej12c: false,
  ej13a: false, ej13b: false, ej13c: false,
  ej14a: false, ej14b: false, ej14c: false,
  dict_invierte: "N", dict_confOrden: "N", dict_omite: "N", dict_agrega: "N",
  dict_dificConectar: "N", dict_espejo: "N",
  dict_caligUnif: "B", dict_caligCoord: "B", dict_caligLimp: "B",
  dict_cohConcord: "B", dict_cohSecuencia: "B", dict_cohEnlace: "B", dict_cohTema: "B", dict_cohEstructura: "B",
  dict_prodPresent: "B", dict_prodExtension: "B", dict_prodOrden: "B", dict_prodIdeas: "B",
  dict_prodTitulo: "B", dict_prodComas: "B", dict_prodPuntuacion: "B", dict_prodInterAdm: "B", dict_prodMayusc: "B",
  comp_invierte: "N", comp_confOrden: "N", comp_omite: "N", comp_agrega: "N",
  comp_dificConectar: "N", comp_espejo: "N",
  comp_caligUnif: "B", comp_caligCoord: "B", comp_caligLimp: "B",
  comp_cohConcord: "B", comp_cohSecuencia: "B", comp_cohEnlace: "B", comp_cohTema: "B", comp_cohEstructura: "B",
  comp_prodPresent: "B", comp_prodExtension: "B", comp_prodOrden: "B", comp_prodIdeas: "B",
  comp_prodTitulo: "B", comp_prodComas: "B", comp_prodPuntuacion: "B", comp_prodInterAdm: "B", comp_prodMayusc: "B",
}
