/**
 * JSON Schema para el output estructurado del análisis IA.
 *
 * Cuando se usa con `tool_use` en Anthropic, Claude garantiza que el output
 * cumple esta estructura — eliminando errores de parseo de JSON.
 */
import type { Tool } from "@anthropic-ai/sdk/resources/messages"

export const ANALYSIS_TOOL: Tool = {
  name: "generar_informe_psicopedagogico",
  description:
    "Genera el informe psicopedagógico estructurado con los 3 perfiles (DAE, Psicomotor, Integrado), fortalezas, áreas de mejora, recomendaciones y plan de seguimiento.",
  input_schema: {
    type: "object",
    properties: {
      perfilDAE: {
        type: "object",
        properties: {
          resumen: {
            type: "string",
            description:
              "Párrafo de 3-5 oraciones describiendo el perfil de DAE: si lee/escribe, si los procesos psíquicos y léxicos son inmaduros para su edad, y cuántos años de desfase respecto al currículo.",
          },
          nivelDificultad: {
            type: "string",
            enum: [
              "sin-dificultades",
              "dificultad-leve",
              "dificultad-moderada",
              "dificultad-severa",
            ],
          },
          areasAfectadas: {
            type: "array",
            items: { type: "string" },
            description: "Lista de áreas con dificultad (máx. 5 elementos)",
          },
          relacionEdadGrado: {
            type: "string",
            description:
              "Relación entre la edad real y la edad esperada para el grado. Qué implica.",
          },
          desfaseAnios: {
            type: ["integer", "null"],
            description: "Años de desfase respecto al currículo del grado (0 si está acorde).",
          },
        },
        required: [
          "resumen",
          "nivelDificultad",
          "areasAfectadas",
          "relacionEdadGrado",
          "desfaseAnios",
        ],
      },
      perfilPsicomotor: {
        type: ["object", "null"],
        description:
          "Solo si se aplicó BPM. Síntesis descriptiva (no diagnóstico). null si no se aplicó BPM.",
        properties: {
          resumen: { type: "string" },
          tonoControlPostural: { type: "string" },
          lateralidad: { type: "string" },
          esquemaCorporal: { type: "string" },
          estructuracionEspacioTemporal: { type: "string" },
          praxiaGlobal: { type: "string" },
          praxiaFina: { type: "string" },
          perfilGeneral: {
            type: "string",
            description: "Clasificación: apráxico | dispráxico | eupráxico | hiperpráxico",
          },
        },
      },
      perfilIntegrado: {
        type: ["object", "null"],
        description:
          "Solo si se aplicó BPM. Cruza el perfil DAE con el psicomotor. null si no aplica.",
        properties: {
          resumen: { type: "string" },
          relacionPMconDAE: { type: "string" },
          tiempoYOrden: { type: "string" },
          espacioYOrientacion: { type: "string" },
          praxiaYEscritura: { type: "string" },
          atencionMemoria: { type: "string" },
        },
      },
      fortalezas: {
        type: "array",
        items: { type: "string" },
        description: "Máximo 3 fortalezas observadas vs expectativas del grado.",
      },
      areasDeMejora: {
        type: "array",
        items: {
          type: "object",
          properties: {
            area: { type: "string" },
            descripcion: { type: "string" },
            brechaConCurriculo: {
              type: "string",
              description: "Qué habilidades del currículo R.M. 1040/2022 no se están logrando.",
            },
            prioridad: {
              type: "string",
              enum: ["alta", "media", "baja"],
            },
          },
          required: ["area", "descripcion", "brechaConCurriculo", "prioridad"],
        },
        description: "Máximo 3 áreas",
      },
      recomendaciones: {
        type: "object",
        properties: {
          paraElAula: {
            type: "array",
            items: {
              type: "object",
              properties: {
                categoria: {
                  type: "string",
                  description:
                    "Una de: Entrada y anticipación | Organización espacial | Ritmo y tiempo | Praxia global | Imitación y gestos | Praxia fina/escritura | Lateralidad | Clima emocional | Lectura | Conciencia fonológica",
                },
                titulo: { type: "string" },
                descripcion: { type: "string" },
                frecuencia: {
                  type: ["string", "null"],
                  description: "Ej: 5-10 min, 2-3 veces/día",
                },
              },
              required: ["categoria", "titulo", "descripcion"],
            },
            description: "Máximo 5 recomendaciones para el aula",
          },
          paraLaFamilia: {
            type: "array",
            items: {
              type: "object",
              properties: {
                titulo: { type: "string" },
                descripcion: { type: "string" },
              },
              required: ["titulo", "descripcion"],
            },
            description: "Máximo 3 recomendaciones para la familia",
          },
          derivacion: {
            type: "object",
            properties: {
              necesaria: { type: "boolean" },
              especialista: {
                type: ["string", "null"],
                description:
                  "psicopedagogo | fonoaudiólogo | psicólogo | terapeuta ocupacional | null",
              },
              justificacion: { type: ["string", "null"] },
            },
            required: ["necesaria", "especialista", "justificacion"],
          },
        },
        required: ["paraElAula", "paraLaFamilia", "derivacion"],
      },
      planSeguimiento: {
        type: "object",
        properties: {
          periodoRevaluacion: {
            type: "string",
            description: "Ej: 3 meses, 6 meses, 1 año",
          },
          indicadoresProgreso: {
            type: "array",
            items: { type: "string" },
            description: "Máximo 3 indicadores medibles",
          },
        },
        required: ["periodoRevaluacion", "indicadoresProgreso"],
      },
    },
    required: [
      "perfilDAE",
      "perfilPsicomotor",
      "perfilIntegrado",
      "fortalezas",
      "areasDeMejora",
      "recomendaciones",
      "planSeguimiento",
    ],
  },
}
