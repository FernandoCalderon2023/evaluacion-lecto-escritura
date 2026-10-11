import test from "node:test"
import assert from "node:assert/strict"
import { elapsedSeconds, readingExpired, timerDisplay, stopActivity } from "./activityTimer"

test("el tiempo usa marcas reales incluso sin actualizaciones de pantalla", () => {
  const timer = { startedAt: 1000 }
  assert.equal(elapsedSeconds(timer, 241_000), 240)
  assert.equal(readingExpired(timer, 240_999), false)
  assert.equal(readingExpired(timer, 241_000), true)
})
test("detener conserva la duración y no completa una lectura interrumpida", () => {
  const timer = { startedAt: 1000, stoppedAt: 31_000 }
  assert.equal(elapsedSeconds(timer, 900_000), 30)
  assert.equal(readingExpired(timer, 900_000), false)
})
test("estado inicial y reloj adelantado no producen tiempos negativos", () => {
  assert.equal(elapsedSeconds(undefined, 0), 0)
  assert.equal(elapsedSeconds({ startedAt: 1000 }, 0), 0)
  assert.equal(readingExpired(undefined, 999999), false)
  assert.equal(timerDisplay(-10), "00:00")
  assert.equal(timerDisplay(240), "04:00")
  assert.equal(timerDisplay(3661), "61:01")
})

test("terminar el texto antes de cuatro minutos no equivale a interrupción", () => {
  const timer = { startedAt: 1000 }
  assert.equal(stopActivity(timer, 31_000, true, true).outcome, "finished")
  assert.equal(stopActivity(timer, 31_000, true).outcome, "interrupted")
  assert.equal(stopActivity(timer, 31_000, false).outcome, "completed")
  assert.equal(stopActivity(timer, 301_000, true, true).outcome, "completed")
  assert.equal(stopActivity(timer, 301_000, true).stoppedAt, 241_000)
})
