import type { AnalisisIA } from "@/types/ai"
import { ANALYSIS_TOOL } from "@/lib/ai/analysisSchema"

/** ¿Está configurado DeepSeek? (activa el proveedor si hay DEEPSEEK_API_KEY en el entorno) */
export function deepseekEnabled(): boolean {
  return !!process.env.DEEPSEEK_API_KEY?.trim()
}

/**
 * DeepSeek a veces serializa los objetos/arrays anidados del function-call como
 * un STRING JSON en vez de como objeto (p. ej. perfilDAE: "{\"resumen\":...}").
 * Este normalizador re-parsea recursivamente cualquier valor string que sea, en
 * realidad, un objeto/array JSON — dejando la estructura como la espera el informe.
 */
function deepParseNested(value: unknown): unknown {
  if (typeof value === "string") {
    const t = value.trim()
    if ((t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"))) {
      try {
        return deepParseNested(JSON.parse(t))
      } catch {
        return value
      }
    }
    return value
  }
  if (Array.isArray(value)) return value.map(deepParseNested)
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) out[k] = deepParseNested(v)
    return out
  }
  return value
}

/**
 * Genera el informe psicopedagógico con DeepSeek (API compatible con OpenAI).
 * Reutiliza el MISMO esquema del informe (ANALYSIS_TOOL) vía function calling,
 * así el output mantiene la estructura solicitada (validada posteriormente por reportGuard), igual que con Anthropic.
 *
 * La API key se lee de process.env.DEEPSEEK_API_KEY — NUNCA se hardcodea.
 */
export async function generarInformeDeepseek(
  systemPrompt: string,
  userMessage: unknown,
): Promise<AnalisisIA> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim()
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY no configurada")

  const userText = typeof userMessage === "string" ? userMessage : JSON.stringify(userMessage)
  const baseUrl = (process.env.DEEPSEEK_BASE_URL?.trim() || "https://api.deepseek.com").replace(/\/$/, "")
  const model = process.env.DEEPSEEK_MODEL?.trim() || "deepseek-chat"

  const body = JSON.stringify({
    model,
    max_tokens: 4096,
    // Temperatura baja → JSON estructurado mucho más fiable (menos malformación).
    temperature: 0.1,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userText },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: ANALYSIS_TOOL.name,
          description: ANALYSIS_TOOL.description,
          parameters: ANALYSIS_TOOL.input_schema,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: ANALYSIS_TOOL.name } },
  })

  // DeepSeek ocasionalmente devuelve JSON malformado en el function-call.
  // Reintentamos hasta 2 veces (cada llamada es independiente) antes de fallar.
  let lastErr: Error | null = null
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // Timeout de 90s por intento: si DeepSeek se cuelga, abortamos y reintentamos
      // en vez de bloquear el worker hasta su maxDuration.
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body,
        // The deadline covers response body parsing as well as connection headers.
        signal: AbortSignal.timeout(90_000),
      })

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Key inválida: reintentar no ayuda. Mensaje accionable.
          throw new Error(`DEEPSEEK_KEY_INVALIDA (HTTP ${res.status}): revisá DEEPSEEK_API_KEY en Vercel.`)
        }
        throw new Error(`DeepSeek HTTP ${res.status}`)
      }

      const data = await res.json()
      const argsStr = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
      if (!argsStr) {
        throw new Error("El proveedor no devolvió sugerencias estructuradas")
      }

      const parsed = JSON.parse(argsStr)
      // Corrige el quirk de DeepSeek (objetos anidados como string JSON).
      return deepParseNested(parsed) as AnalisisIA
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      // No reintentar errores de autenticación: la key no va a volverse válida.
      if (lastErr.message.startsWith("DEEPSEEK_KEY_INVALIDA")) break
    }
  }
  throw new Error(`DeepSeek falló tras un máximo de 2 intentos: ${lastErr?.message ?? "error desconocido"}`)
}
