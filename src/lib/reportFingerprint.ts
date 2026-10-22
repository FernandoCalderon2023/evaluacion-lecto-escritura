import { createHash } from "node:crypto"
import { REPORT_RULES_VERSION } from "./reportEvidence"
// These fields change when AI is generated but do not alter assessment inputs.
const ignored = new Set(["analisisIA", "analisisGeneradoEn", "updatedAt", "estudiante"])
export function reportFingerprint(record: Record<string, unknown>) {
 const fields = Object.keys(record).filter(k => !ignored.has(k) && !k.startsWith("score") && !k.startsWith("bpmScore") && k !== "bpmPerfilGeneral" && k !== "estadoAprendizaje").sort().map(k => [k, record[k] instanceof Date ? (record[k] as Date).toISOString() : record[k]])
 return createHash("sha256").update(JSON.stringify({ version: REPORT_RULES_VERSION, fields })).digest("hex")
}
