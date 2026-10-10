import { test } from "node:test"
import assert from "node:assert/strict"
import { EVALUACION_DEFAULTS, EvaluacionFormData } from "@/types/evaluacion"
import { calcularScores, scoreWriting, scoreBpm } from "./scoring"
import { calcularCorrelacionPsicomotora } from "./analisis/correlacionPsicomotora"
import { draftKey, readDraft } from "./evaluationDraft"
import { summarizeStudents } from "./dashboardSummary"
import { buildUserMessage } from "./ai/promptBuilder"

function complete(): Partial<EvaluacionFormData> {
  const ev: Record<string, unknown> = { ...EVALUACION_DEFAULTS }
  for (const key of Object.keys(ev)) {
    if (key.startsWith("ej") && typeof ev[key] === "boolean") ev[key] = true
    if (/^(dict|comp)_/.test(key)) ev[key] = /_(calig|coh|prod)/.test(key) ? "B" : "N"
  }
  for (const key of ["compMemoriza", "compIdeas", "compValora", "compInterpreta", "compAsocia"]) ev[key] = "S"
  return ev as Partial<EvaluacionFormData>
}

test("new evaluation does not prefill writing as correct", () => {
  const s = calcularScores(EVALUACION_DEFAULTS)
  assert.equal(s.dictado.registro, "no-evaluado")
  assert.equal(s.composicion.registro, "no-evaluado")
  assert.equal(s.lectura.registro, "no-evaluado")
  assert.equal(s.estadoGeneral, "evaluacion-incompleta")
})

test("complete favorable evaluation retains the original scoring", () => {
  const s = calcularScores(complete())
  assert.equal(s.estadoGeneral, "sin-dificultades")
  assert.equal(s.dictado.positiveTotal, 34)
  assert.equal(s.dictado.itemsRespondidos, 23)
  assert.equal(s.dictado.registro, "completo")
})

test("one missing writing response makes the result provisional, not a difficulty", () => {
  const ev = { ...complete(), dict_caligUnif: "" as const }
  const s = calcularScores(ev)
  assert.equal(s.dictado.registro, "incompleto")
  assert.equal(s.dictado.hasDifficulty, false)
  assert.equal(s.estadoGeneral, "evaluacion-incompleta")
})

test("a completed low writing performance still signals difficulty", () => {
  const ev = complete() as Record<string, unknown>
  for (const k of Object.keys(ev)) if (/^dict_(calig|coh|prod)/.test(k)) ev[k] = "M"
  const s = scoreWriting(ev, "dict")
  assert.equal(s.registro, "completo")
  assert.equal(s.hasDifficulty, true)
  assert.equal(s.positiveTotal, 0)
})

test("completed N errors are observations, not blanks", () => {
  const s = scoreWriting(complete(), "comp")
  assert.equal(s.itemsRespondidos, 23)
  assert.equal(s.errorScore, 0)
})

test("partial comprehension is not classified as low performance", () => {
  const s = calcularScores({ ...complete(), compIdeas: "" })
  assert.equal(s.lectura.registro, "incompleto")
  assert.equal(s.lectura.hasDifficulty, false)
  assert.equal(s.estadoGeneral, "evaluacion-incompleta")
})

test("retired BPM items alone no longer mark BPM as applied", () => {
  const b = scoreBpm({ bpm_paratoniaMI: 1, bpm_latAdquirida: "D" })
  assert.equal(b.applied, false)
  assert.equal(b.tonicidad.perfil, "no evaluado")
})

test("BPM with only tonicidad cannot attribute a cognitive-pedagogical origin", () => {
  const ev = { ...complete(), bpm_sincinBucales: 4, errorRotacion: "I" as const }
  const c = calcularCorrelacionPsicomotora(ev, calcularScores(ev))
  assert.equal(c.origenProbable, "no-determinable")
  assert.doesNotMatch(c.interpretacion, /dentro de lo adecuado/)
  assert.ok(c.filas.every(f => !/paratonía|adquirida|kinestésico/.test(f.area)))
})

const keyBpm = {
  bpm_latOcular: "D", bpm_latAuditiva: "D", bpm_latManual: "D", bpm_latPodal: "D",
  bpm_etOrganizacion: 4, bpm_etEstructDinamica: 4, bpm_etEstructRitmica: 4,
  bpm_pfCoordDinamManual: 4, bpm_pfTamborilear: 4, bpm_pfVelocidadPrecision: 4,
}

test("complete key BPM areas preserve the interpretation rule", () => {
  const ev = { ...complete(), ...keyBpm, errorRotacion: "I" as const }
  assert.equal(calcularCorrelacionPsicomotora(ev, calcularScores(ev)).origenProbable, "cognitivo-pedagogico")
  const altered = { ...ev, bpm_pfCoordDinamManual: 1, bpm_pfTamborilear: 1, bpm_pfVelocidadPrecision: 1 }
  assert.equal(calcularCorrelacionPsicomotora(altered, calcularScores(altered)).origenProbable, "neuro-psicomotor")
})

test("a single missing key BPM item keeps the origin undetermined", () => {
  const ev = { ...complete(), ...keyBpm, bpm_pfTamborilear: null, errorRotacion: "I" as const }
  assert.equal(calcularCorrelacionPsicomotora(ev, calcularScores(ev)).origenProbable, "no-determinable")
})

test("partial laterality is not presented as a definitive score", () => {
  const lat = scoreBpm({ bpm_latOcular: "D" }).lateralidad
  assert.equal(lat.tipo, "incompleta")
  assert.equal(lat.score, 0)
  assert.equal(lat.definida, false)
})

test("dashboard counts each student once and separates unassessed students", () => {
  const summary = summarizeStudents([
    { evaluaciones: [complete(), {}] },
    { evaluaciones: [{}] },
    { evaluaciones: [] },
  ])
  assert.deepEqual(summary, { "sin-dificultades": 1, "evaluacion-incompleta": 1, "sin-evaluar": 1 })
  assert.equal(Object.values(summary).reduce((a,b) => a+b, 0), 3)
})

test("draft recovery is isolated by owner, student and server revision", () => {
  assert.notEqual(draftKey("a", "e", "s", "1"), draftKey("b", "e", "s", "1"))
  assert.notEqual(draftKey("a", "e", "s", "1"), draftKey("a", "e", "s", "2"))
  assert.notEqual(draftKey("a", undefined, "s"), draftKey("a", undefined, "other"))
})

test("draft preserves valid answers, rejects expired or unauthorized data", () => {
  const now = 200000000
  const draft = { version: 1, savedAt: now - 1000, step: 15, data: { estudianteId: "s", dict_caligUnif: "M" } }
  const parse = (d: unknown, ids = ["s"]) => readDraft(JSON.stringify(d), ids, now)
  assert.equal(parse(draft)?.data.dict_caligUnif, "M")
  assert.equal(parse(draft, ["other"]), null)
  assert.equal(parse({ ...draft, savedAt: now - 86400001 }), null)
  assert.equal(parse({ ...draft, step: 100 }), null)
  assert.equal(parse({ ...draft, data: { docenteId: "other" } }), null)
  assert.equal(readDraft("{bad", ["s"]), null)
})

test("AI input identifies incomplete writing and recognizes sex F", () => {
  const ev = { ...EVALUACION_DEFAULTS, fecha: new Date(), evaluador: "Evaluador" }
  const student = { sexo: "F", grado: "3º de Primaria", unidadEducativa: "Prueba" }
  const prompt = buildUserMessage(student as any, ev as any, calcularScores(ev as any))
  assert.match(prompt, /NO CONCLUYENTE: registro no-evaluado/)
  assert.match(prompt, /EVALUACION-INCOMPLETA/)
})

import { loginDestination } from "./loginDestination"
test("login preserves allowed local destinations", () => {
  assert.equal(loginDestination("/evaluaciones/123/editar?paso=2"), "/evaluaciones/123/editar?paso=2")
  assert.equal(loginDestination("/guia"), "/guia")
})
test("login rejects external and unrelated destinations", () => {
  for (const value of [null, "https://evil.invalid", "//evil.invalid", "/\\evil.invalid", "/api/admin", "/dashboard/../../login", "/dashboardevil"]) {
    assert.equal(loginDestination(value), "/dashboard")
  }
})
