import { EstadoAprendizaje } from "./evaluacion"

export interface AnalisisIA {
  perfilDAE: {
    resumen: string
    nivelDificultad: EstadoAprendizaje
    areasAfectadas: string[]
    relacionEdadGrado: string
    desfaseAnios: number | null
  }
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
  }
  planSeguimiento: {
    periodoRevaluacion: string
    indicadoresProgreso: string[]
  }
}
