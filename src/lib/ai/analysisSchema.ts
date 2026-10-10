import type { Tool } from "@anthropic-ai/sdk/resources/messages"

// Request only suggestions: observations/classifications are calculated by reportGuard.
// A tool schema is not a guarantee; Zod validates every response before persistence.
const text = { type: "string", minLength: 1, maxLength: 1600 }
export const ANALYSIS_TOOL: Tool = {
  name: "generar_informe_psicopedagogico",
  description: "Propone actividades educativas condicionales para revisión docente, sin diagnósticos ni afirmaciones sobre el estudiante.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    required: ["recomendaciones"],
    properties: {
      recomendaciones: {
        type: "object", additionalProperties: false, required: ["paraElAula", "paraLaFamilia"],
        properties: {
          paraElAula: { type: "array", maxItems: 12, items: { type: "object", additionalProperties: false, required: ["categoria", "titulo", "descripcion"], properties: { categoria: text, titulo: text, descripcion: text, frecuencia: text } } },
          paraLaFamilia: { type: "array", maxItems: 10, items: { type: "object", additionalProperties: false, required: ["titulo", "descripcion"], properties: { titulo: text, descripcion: text } } },
        },
      },
    },
  },
}
