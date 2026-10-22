import { test } from "node:test"
import assert from "node:assert/strict"
import { calcularScores } from "./scoring"
import { EVALUACION_DEFAULTS } from "@/types/evaluacion"
import { reportEvidence } from "./reportEvidence"
import { reportFingerprint } from "./reportFingerprint"

test("audit evidence never presents missing areas as zero scores", () => {
 const rows=reportEvidence(calcularScores(EVALUACION_DEFAULTS))
 assert.equal(rows.length,5)
 assert.ok(rows.every(r => r.dato.startsWith("Pendiente") && !r.alerta))
})
test("audit explains confirmed zero versus unknown and writing error direction", () => {
 const rows=reportEvidence(calcularScores({...EVALUACION_DEFAULTS,cognitivoAplicado:true}))
 const cognitive=rows.find(r=>r.area==="Procesos cognitivos")!
 assert.equal(cognitive.alerta,true);assert.match(cognitive.dato,/0\/27/);assert.match(cognitive.regla,/≤15/)
 assert.match(rows.find(r=>r.area==="Escritura (dictado)")!.regla,/errores >9\/18/)
})
test("fingerprint is stable across key order, AI generation and derived score refresh", () => {
 const before={id:"a",ej7:true,fecha:new Date("2026-10-22T12:00:00Z"),scoreCognitivo:1}
 const after={scoreCognitivo:9,fecha:"2026-10-22T12:00:00.000Z",ej7:true,id:"a",updatedAt:new Date(),analisisIA:"AI",analisisGeneradoEn:new Date()}
 assert.equal(reportFingerprint(before),reportFingerprint(after))
 assert.notEqual(reportFingerprint(before),reportFingerprint({...before,ej7:false}))
})
