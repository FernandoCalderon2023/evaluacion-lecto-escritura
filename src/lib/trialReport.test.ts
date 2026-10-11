import test from "node:test"
import assert from "node:assert/strict"
import { calcularScores } from "./scoring"
import { trialReportAreas } from "./trialReport"
test("la prueba no convierte campos sin aplicar en ceros de desempeño", () => {
 const areas=trialReportAreas(calcularScores({}))
 assert.equal(areas.length,5)
 assert.ok(areas.every(a=>a.registro!=="completo"&&a.result==="Pendiente de completar"))
})
test("los resultados gratuitos dependen de la confirmación real del bloque", () => {
 const partial=trialReportAreas(calcularScores({ej7:true})).find(a=>a.name==="Procesos cognitivos")!
 assert.equal(partial.result,"Pendiente de completar")
 const complete=trialReportAreas(calcularScores({ej7:true,cognitivoAplicado:true})).find(a=>a.name==="Procesos cognitivos")!
 assert.equal(complete.registro,"completo")
 assert.match(complete.result,/1 \/ 27/)
})
