import { AnalisisIA } from "@/types/ai"

export function parseClaudeResponse(rawText: string): AnalisisIA {
  // Log para debug
  console.log("[parser] Longitud respuesta:", rawText.length)
  console.log("[parser] Primeros 200 chars:", rawText.slice(0, 200))
  console.log("[parser] Últimos 200 chars:", rawText.slice(-200))

  // Strip markdown code fences
  let text = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim()

  // Find JSON object
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1) {
    console.error("[parser] No se encontró JSON. Texto completo:", text.slice(0, 500))
    throw new Error("No se encontró JSON válido en la respuesta de Claude")
  }

  let jsonStr = text.slice(start, end + 1)

  // Fix common JSON issues from LLMs
  // Remove trailing commas before } or ]
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, "$1")
  // Fix unescaped newlines inside strings
  jsonStr = jsonStr.replace(/(?<=":[ ]*"[^"]*)\n(?=[^"]*")/g, "\\n")

  try {
    return JSON.parse(jsonStr) as AnalisisIA
  } catch (e1) {
    console.error("[parser] JSON.parse falló, intentando reparar...")
    console.error("[parser] Error:", (e1 as Error).message)

    // Try to fix truncated JSON by closing open brackets
    try {
      let fixed = jsonStr
      // Count open/close brackets
      const openBraces = (fixed.match(/{/g) || []).length
      const closeBraces = (fixed.match(/}/g) || []).length
      const openBrackets = (fixed.match(/\[/g) || []).length
      const closeBrackets = (fixed.match(/]/g) || []).length

      // Close unclosed strings (if last char before EOF is not " and we're inside a string)
      if (fixed.endsWith('"') === false && closeBraces < openBraces) {
        fixed += '"'
      }

      // Close arrays then objects
      for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += "]"
      for (let i = 0; i < openBraces - closeBraces; i++) fixed += "}"

      // Remove trailing commas again
      fixed = fixed.replace(/,\s*([}\]])/g, "$1")

      console.log("[parser] Intentando parsear JSON reparado...")
      return JSON.parse(fixed) as AnalisisIA
    } catch (e2) {
      console.error("[parser] Reparación falló:", (e2 as Error).message)
      console.error("[parser] JSON (primeros 1000):", jsonStr.slice(0, 1000))
      throw new Error(`Error al parsear JSON de Claude: ${(e1 as Error).message}`)
    }
  }
}
