import { test } from "node:test"
import assert from "node:assert/strict"
import { normKey, nombreLimpio } from "./normalize"

test("normKey fusiona variantes del mismo colegio", () => {
  const k = normKey("Simón Bolívar ")
  assert.equal(normKey("SIMON BOLIVAR"), k)
  assert.equal(normKey("Simon Bolivar "), k)
  assert.equal(normKey("  simón   bolívar "), k)
})

test("normKey distingue colegios distintos", () => {
  assert.notEqual(normKey("Simón Bolívar"), normKey("16 de Julio"))
})

test("normKey de vacío/espacios/null es cadena vacía", () => {
  assert.equal(normKey("   "), "")
  assert.equal(normKey(""), "")
  assert.equal(normKey(null), "")
  assert.equal(normKey(undefined), "")
})

test("nombreLimpio colapsa espacios y recorta sin cambiar mayúsculas/acentos", () => {
  assert.equal(nombreLimpio("  Simón   Bolívar "), "Simón Bolívar")
  assert.equal(nombreLimpio(null), "")
})
