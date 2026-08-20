import { EstadoAprendizaje } from "./evaluacion"

export interface AnalisisIA {
  /** Resumen ejecutivo que abre el informe (nuevo — puede faltar en informes antiguos). */
  sintesisEjecutiva?: string
  perfilDAE: {
    resumen: string
    nivelDificultad: EstadoAprendizaje
    areasAfectadas: string[]
    relacionEdadGrado: string
    desfaseAnios: number | null
  }
  /** Análisis por cada proceso evaluado (nuevo). */
  analisisPorProceso?: Array<{
    proceso: string
    nivel: string
    datoClave: string
    interpretacion: string
  }>
  /** Interpretación ítem por ítem de los ejercicios más informativos (nuevo). */
  hallazgosPorEjercicio?: Array<{
    ejercicio: string
    resultado: string
    queRevela: string
  }>
  perfilPsicomotor: {
    resumen: string
    tonoControlPostural: string
    lateralidad: string
    esquemaCorporal: string
    estructuracionEspacioTemporal: string
    praxiaGlobal: string
    praxiaFina: string
    perfilGeneral: string
  } | null
  perfilIntegrado: {
    resumen: string
    relacionPMconDAE: string
    tiempoYOrden: string
    espacioYOrientacion: string
    praxiaYEscritura: string
    atencionMemoria: string
  } | null
  fortalezas: string[]
  areasDeMejora: Array<{
    area: string
    descripcion: string
    brechaConCurriculo: string
    prioridad: "alta" | "media" | "baja"
  }>
  recomendaciones: {
    paraElAula: Array<{
      categoria: string
      titulo: string
      descripcion: string
      frecuencia?: string
    }>
    paraLaFamilia: Array<{
      titulo: string
      descripcion: string
    }>
    derivacion: {
      necesaria: boolean
      especialista: string | null
      justificacion: string | null
    }
    /** Materiales/recursos concretos sugeridos (nuevo). */
    recursosSugeridos?: string[]
  }
  planSeguimiento: {
    periodoRevaluacion: string
    indicadoresProgreso: string[]
  }
}
