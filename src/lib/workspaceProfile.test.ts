import test from "node:test"
import assert from "node:assert/strict"
import { workspaceProfile } from "./workspaceProfile"
test("perfil docente sin asignación institucional", () => { assert.equal(workspaceProfile("DOCENTE", ["DOCENTE"]).kind, "teacher") })
test("familia y administrador conservan su espacio aunque existan membresías", () => {
  assert.equal(workspaceProfile("FAMILIA", ["DIRECTOR"]).kind, "family")
  assert.equal(workspaceProfile("ADMIN", ["DISTRITAL"]).kind, "admin")
})
test("dirección y ámbito territorial se derivan de asignaciones, no del rol de cuenta", () => {
  assert.equal(workspaceProfile("DOCENTE", ["DIRECTOR"]).kind, "director")
  assert.equal(workspaceProfile("DOCENTE", ["DIRECTOR", "DEPARTAMENTAL"]).kind, "regional")
  assert.equal(workspaceProfile("DOCENTE", ["DISTRITAL"]).institutional, true)
  assert.equal(workspaceProfile("DIRECTOR", []).institutional, false)
})
