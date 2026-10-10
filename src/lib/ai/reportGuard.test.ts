import { test } from "node:test"
import assert from "node:assert/strict"
import { guardReport, readGuardedReport, recommendationContext } from "./reportGuard"
import { calcularScores } from "@/lib/scoring"
import { EVALUACION_DEFAULTS } from "@/types/evaluacion"
const empty = calcularScores(EVALUACION_DEFAULTS)
const raw = { recomendaciones: { paraElAula: [{ categoria: "Lectura", titulo: "Lectura compartida", descripcion: "Se puede proponer leer un cuento y conversar sobre él." }], paraLaFamilia: [] } }

test("missing records never become confirmed difficulties in a report", () => {
  const r = guardReport(raw, empty)
  assert.equal(r.perfilDAE.nivelDificultad, "evaluacion-incompleta")
  assert.deepEqual(r.perfilDAE.areasAfectadas, [])
  assert.equal(r.perfilPsicomotor, null)
  assert.equal(r.perfilIntegrado, null)
  assert.equal(r.correlacionNeuropsicomotora, null)
  assert.equal(r.fortalezas.length, 0)
  assert.ok(r.controlCalidad?.advertencias.some(x => x.includes("casilla desmarcada")))
})
test("model diagnoses, invented years, strengths and referrals never reach findings", () => {
  const r = guardReport({ ...raw, perfilDAE: { resumen: "Tiene dislexia severa", nivelDificultad: "dificultad-severa", desfaseAnios: 8 }, fortalezas: ["Inventada"], perfilIntegrado: { resumen: "Causalidad inventada" } }, empty)
  assert.equal(r.perfilDAE.desfaseAnios, null)
  assert.equal(r.recomendaciones.derivacion.necesaria, false)
  assert.ok(!JSON.stringify(r).includes("Tiene dislexia"))
  assert.ok(!JSON.stringify(r).includes("Inventada"))
})
test("malformed, excessive or non-string suggestions fail closed", () => {
  for (const r of [null, {}, { recomendaciones: { paraElAula: "texto", paraLaFamilia: [] } }, { recomendaciones: { paraElAula: Array(13).fill(raw.recomendaciones.paraElAula[0]), paraLaFamilia: [] } }, { recomendaciones: { paraElAula: [{ categoria: "x", titulo: "x", descripcion: "x".repeat(1601) }], paraLaFamilia: [] } }]) assert.throws(() => guardReport(r, empty))
})
test("clinical and unverified URL suggestions are removed; neutral ones survive", () => {
  const r = guardReport({ recomendaciones: { paraElAula: [...raw.recomendaciones.paraElAula, { categoria: "Salud", titulo: "Trastorno", descripcion: "Tratar dislexia" }], paraLaFamilia: [{ titulo: "Material", descripcion: "Ir a https://inventado.invalid" }] } }, empty)
  assert.equal(r.recomendaciones.paraElAula.length, 1)
  assert.equal(r.recomendaciones.paraLaFamilia.length, 0)
})
test("old reports are guarded at read time; corrupt reports are hidden", () => {
  assert.equal(readGuardedReport("{", empty), null)
  assert.equal(readGuardedReport(null, empty), null)
  assert.equal(readGuardedReport(JSON.stringify({ ...raw, perfilDAE: { resumen: "Inventado" } }), empty)?.controlCalidad?.version, 1)
})
test("provider context contains no identifying or free-text fields", () => {
  const context = recommendationContext(empty)
  assert.ok(!context.includes("nombre"))
  assert.ok(!context.includes("observaciones"))
  assert.equal(JSON.parse(context).cognitivo.aplicacionConfirmada, false)
  assert.ok(context.length < 1500)
})
