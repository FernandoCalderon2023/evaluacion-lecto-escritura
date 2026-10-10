import { EVALUACION_DEFAULTS, EvaluacionFormData } from "@/types/evaluacion"

export interface EvaluationDraft {
  version: 1
  savedAt: number
  step: number
  data: Partial<EvaluacionFormData>
}

export function draftKey(owner: string, evaluation?: string, student?: string, revision?: string) {
  return ["sideda-draft-v1", owner, evaluation ?? "new", student ?? "any", revision ?? ""].map(encodeURIComponent).join(":")
}

export function readDraft(raw: string | null, students: string[], now = Date.now()): EvaluationDraft | null {
  if (!raw) return null
  try {
    const d = JSON.parse(raw)
    if (d.version !== 1 || !Number.isFinite(d.savedAt) || d.savedAt > now || now - d.savedAt > 86400000) return null
    if (!Number.isInteger(d.step) || d.step < 0 || d.step > 19 || !d.data || typeof d.data !== "object" || Array.isArray(d.data)) return null
    if (d.data.estudianteId && !students.includes(d.data.estudianteId)) return null
    const allowed = new Set([...Object.keys(EVALUACION_DEFAULTS), "estudianteId", "evaluador", "fecha"])
    if (Object.entries(d.data).some(([k, v]) => !allowed.has(k) || (v !== null && !["string", "number", "boolean"].includes(typeof v)))) return null
    return d as EvaluationDraft
  } catch { return null }
}
