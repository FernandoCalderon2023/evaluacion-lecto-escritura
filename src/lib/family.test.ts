import { test } from "node:test"
import assert from "node:assert/strict"
import { familySchema, familySummary, FAMILY_ITEMS } from "./family"
import type { FamilyInput } from "./family"
const missing = Object.fromEntries(FAMILY_ITEMS.map(i => [i.id,"no_observado"])) as FamilyInput["respuestas"]
test("all unobserved family answers produce no findings or suggested deficits", () => {
 const r = familySummary(missing)
 assert.equal(r.observados, 0)
 assert.equal(r.apoyos.length, 0)
 assert.equal(r.autonomos.length, 0)
 assert.equal(r.pendientes.length, 6)
})
test("family support maps only explicit answers; no numerical risk score", () => {
 const r = familySummary({...missing,lectura:"a_veces",rutina:"autonomo"})
 assert.equal(r.observados, 2)
 assert.equal(r.apoyos.length, 1)
 assert.equal(r.autonomos.length, 1)
 assert.equal('score' in r, false)
})
test("family schema rejects missing answers, consent, unknown fields and unsupported age", () => {
 const valid = {id:"698b0f8d-697c-4a18-a846-77f3ebc6ef12",alias:"QA",edad:8,respuestas:missing,autoriza:true}
 assert.ok(familySchema.safeParse(valid).success)
 for (const bad of [{...valid,autoriza:false},{...valid,edad:5},{...valid,respuestas:{}},{...valid,usuarioId:"other"}]) assert.ok(!familySchema.safeParse(bad).success)
})
