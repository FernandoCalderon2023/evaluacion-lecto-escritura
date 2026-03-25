import { EstadoAprendizaje } from "./evaluacion"

export interface AnalisisIA {
  diagnostico: {
    resumen: string
    nivelDificultad: EstadoAprendizaje
    areasAfectadas: string[]
    relacionEdadGrado?: string
  }
  fortalezas: string[]
  areasDeMejora: Array<{
    area: string
    descripcion: string
    brechaConCurriculo?: string
    prioridad: "alta" | "media" | "baja"
  }>
  recomendaciones: {
    paraElDocente: Array<{
      titulo: string
      descripcion: string
      frecuencia: string
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
