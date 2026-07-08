import { test } from "node:test"
import assert from "node:assert/strict"
import { scoreCognitive } from "./cognitiveScoring"
import { scoreLexical } from "./lexicalScoring"
import { calcularScores } from "./index"

// Umbrales oficiales del Instrumento MINEDU 2012:
//   Cognitivo: >15 de 27 aciertos = sin dificultad
//   Léxico:    >8 de 17 aciertos  = sin dificultad
// Cada sub-ítem booleano vale exactamente 1 punto.

const COGNITIVE_ALL_TRUE = {
  ej3a1: true, ej3a2: true, ej3a3: true,
  ej3b1: true, ej3b2: true, ej3b3: true,
  ej4a: true, ej4b: true,
  ej5aFrutas: true, ej5aAnimales: true, ej5aDeportes: true, ej5b: true,
  ej6a: true, ej6b: true, ej6c: true,
  ej7: true,
  ej8a: true, ej8b: true, ej8c: true, ej8d: true,
  ej9a: true, ej9b: true, ej9c: true, ej9d: true,
  ej10a: true, ej10b: true, ej10c: true,
}

const LEXICAL_ALL_TRUE = {
  ej11a1: true, ej11a2: true, ej11a3: true, ej11a4: true,
  ej11b1: true, ej11b2: true, ej11b3: true, ej11b4: true,
  ej12a: true, ej12b: true, ej12c: true,
  ej13a: true, ej13b: true, ej13c: true,
  ej14a: true, ej14b: true, ej14c: true,
}

test("cognitivo: todos correctos = 27/27, sin dificultad", () => {
  const r = scoreCognitive(COGNITIVE_ALL_TRUE as never)
  assert.equal(r.totalCorrect, 27)
  assert.equal(r.totalItems, 27)
  assert.equal(r.hasDifficulty, false)
})

test("cognitivo: ninguno correcto = 0/27, con dificultad", () => {
  const r = scoreCognitive({} as never)
  assert.equal(r.totalCorrect, 0)
  assert.equal(r.hasDifficulty, true)
})

test("cognitivo: umbral exacto — 15 = dificultad, 16 = sin dificultad", () => {
  const keys = Object.keys(COGNITIVE_ALL_TRUE)
  const con15 = Object.fromEntries(keys.slice(0, 15).map((k) => [k, true]))
  const r15 = scoreCognitive(con15 as never)
  assert.equal(r15.totalCorrect, 15)
  assert.equal(r15.hasDifficulty, true)

  const con16 = Object.fromEntries(keys.slice(0, 16).map((k) => [k, true]))
  const r16 = scoreCognitive(con16 as never)
  assert.equal(r16.totalCorrect, 16)
  assert.equal(r16.hasDifficulty, false)
})

test("léxico: todos correctos = 17/17, sin dificultad", () => {
  const r = scoreLexical(LEXICAL_ALL_TRUE as never)
  assert.equal(r.totalCorrect, 17)
  assert.equal(r.hasDifficulty, false)
})

test("léxico: ninguno correcto = 0/17, con dificultad", () => {
  const r = scoreLexical({} as never)
  assert.equal(r.totalCorrect, 0)
  assert.equal(r.hasDifficulty, true)
})

test("léxico: umbral exacto — 8 = dificultad, 9 = sin dificultad", () => {
  const keys = Object.keys(LEXICAL_ALL_TRUE)
  const con8 = Object.fromEntries(keys.slice(0, 8).map((k) => [k, true]))
  assert.equal(scoreLexical(con8 as never).hasDifficulty, true)
  const con9 = Object.fromEntries(keys.slice(0, 9).map((k) => [k, true]))
  assert.equal(scoreLexical(con9 as never).hasDifficulty, false)
})

test("integración: evaluación vacía marca múltiples áreas con dificultad", () => {
  const s = calcularScores({} as never)
  assert.equal(s.cognitivo.hasDifficulty, true)
  assert.equal(s.lexical.hasDifficulty, true)
  assert.ok(["dificultad-moderada", "dificultad-severa"].includes(s.estadoGeneral))
})
