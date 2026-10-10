import { calcularScores } from "@/lib/scoring"
import { EvaluacionFormData } from "@/types/evaluacion"

/** One latest accessible evaluation per student, selected by the database. */
export function summarizeStudents(students: { evaluaciones: Partial<EvaluacionFormData>[] }[]) {
  const porEstado: Record<string, number> = {}
  for (const student of students) {
    const latest = student.evaluaciones[0]
    const estado = latest ? calcularScores(latest).estadoGeneral : "sin-evaluar"
    porEstado[estado] = (porEstado[estado] ?? 0) + 1
  }
  return porEstado
}
