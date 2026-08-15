import type { AnalisisIA } from "@/types/ai"
import { ANALYSIS_TOOL } from "@/lib/ai/analysisSchema"

/** ¿Está configurado DeepSeek? (activa el proveedor si hay DEEPSEEK_API_KEY en el entorno) */
export function deepseekEnabled(): boolean {
  return !!process.env.DEEPSEEK_API_KEY?.trim()
}

/**
 * Genera el informe psicopedagógico con DeepSeek (API compatible con OpenAI).
 * Reutiliza el MISMO esquema del informe (ANALYSIS_TOOL) vía function calling,
 * así el output mantiene la estructura garantizada, igual que con Anthropic.
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

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      temperature: 0.7,
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
    }),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => "")
    throw new Error(`DeepSeek HTTP ${res.status}: ${errText.slice(0, 300)}`)
  }

  const data = await res.json()
  const argsStr = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments
  if (!argsStr) {
    const content = data?.choices?.[0]?.message?.content ?? ""
    throw new Error(`DeepSeek no devolvió function call. Content: ${String(content).slice(0, 200)}`)
  }
  return JSON.parse(argsStr) as AnalisisIA
}
