import { AnalisisIA } from "@/types/ai"

export function parseClaudeResponse(rawText: string): AnalisisIA {
  // Strip markdown code fences if present
  let text = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim()

  // Find the first { and last } to extract JSON
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1) {
    throw new Error("No se encontró JSON válido en la respuesta de Claude")
  }
  const jsonStr = text.slice(start, end + 1)

  try {
    return JSON.parse(jsonStr) as AnalisisIA
  } catch {
    throw new Error("Error al parsear la respuesta JSON de Claude")
  }
}
