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
      sintesisEjecutiva: {
        type: "string",
        description:
          "Resumen ejecutivo de 3-4 oraciones que ABRE el informe: estado general del/la estudiante, la fortaleza principal en la que apoyarse, el área prioritaria a trabajar y un cierre esperanzador. Es lo primero que lee el/la docente.",
      },
      perfilDAE: {
        type: "object",
        properties: {
          resumen: {
            type: "string",
            description:
              "Párrafo EMPÁTICO de 3-4 oraciones describiendo el perfil. Conecta lo observado con la fase evolutiva (Frith/Ehri) y la edad/grado. Usa lenguaje cálido y constructivo, hablando del/la estudiante por su sexo (nunca por código). Evita etiquetas clínicas.",
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
              "1-2 oraciones cálidas conectando edad real con expectativas del grado. Si hay desfase, encuádralo como punto de partida desde donde construir.",
          },
          desfaseAnios: {
            type: ["integer", "null"],
            description: "Años de desfase respecto al currículo del grado (0 si está acorde). Puede ser número negativo si está adelantado.",
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
        description: "Solo si se aplicó BPM. Síntesis descriptiva empática (NO diagnóstico). null si no aplica.",
        properties: {
          resumen: {
            type: "string",
            description: "2-3 oraciones cálidas describiendo el desarrollo psicomotor global del/la estudiante en términos de su unidad funcional cuerpo-mente (Da Fonseca).",
          },
          tonoControlPostural: {
            type: "string",
            description: "1-2 oraciones. Tono muscular, control postural, seguridad gravitatoria. Lenguaje descriptivo, sin alarmar.",
          },
          lateralidad: {
            type: "string",
            description: "1-2 oraciones. Cómo está la lateralidad y qué implica para la orientación espacial en lecto-escritura.",
          },
          esquemaCorporal: {
            type: "string",
            description: "1-2 oraciones. Noción del cuerpo, somatognosia, componente kinestésico.",
          },
          estructuracionEspacioTemporal: {
            type: "string",
            description: "1-2 oraciones. Ritmo, sucesión, relaciones espaciales. Clave para grafema-fonema.",
          },
          praxiaGlobal: {
            type: "string",
            description: "1-2 oraciones. Planificación y ejecución motora amplia.",
          },
          praxiaFina: {
            type: "string",
            description: "1-2 oraciones. Micromotricidad, pinza, trazo, velocidad-precisión.",
          },
          perfilGeneral: {
            type: "string",
            description: "Una palabra: apráxico | dispráxico | eupráxico | hiperpráxico",
          },
        },
      },
      perfilIntegrado: {
        type: ["object", "null"],
        description: "Solo si se aplicó BPM. Hilo narrativo conectando psicomotricidad con lecto-escritura. null si no aplica.",
        properties: {
          resumen: {
            type: "string",
            description: "3-4 oraciones con HILO NARRATIVO claro: cómo el cuerpo y la psicomotricidad sostienen (o desafían) los aprendizajes lectoescritos. Tono cálido.",
          },
          relacionPMconDAE: {
            type: "string",
            description: "1-2 oraciones. Conexión causa-efecto entre perfil psicomotor y dificultades DAE específicas.",
          },
          tiempoYOrden: {
            type: "string",
            description: "1-2 oraciones. Cómo el pulso temporal interno impacta la cadena grafema-fonema.",
          },
          espacioYOrientacion: {
            type: "string",
            description: "1-2 oraciones. Dismetría/lateralidad → orientación izq-der, márgenes, linealidad de escritura.",
          },
          praxiaYEscritura: {
            type: "string",
            description: "1-2 oraciones. Cómo la micromotricidad sostiene la forma y fluidez del trazo.",
          },
          atencionMemoria: {
            type: "string",
            description: "1-2 oraciones. Aprendizaje de gestos motores ↔ automatización de reglas ortográficas.",
          },
        },
      },
      analisisPorProceso: {
        type: "array",
        items: {
          type: "object",
          properties: {
            proceso: {
              type: "string",
              description: "Nombre del proceso: 'Lectura y fluidez' | 'Comprensión lectora' | 'Procesos cognitivos' | 'Procesos léxicos (conciencia fonológica)' | 'Escritura' | 'Psicomotricidad (BPM)' (este último SOLO si se aplicó BPM).",
            },
            nivel: {
              type: "string",
              enum: ["Consolidado", "En desarrollo", "Inicial", "No evaluado"],
            },
            datoClave: {
              type: "string",
              description: "Dato concreto que ancla el análisis (ej: '5/27', 'comprensión 33%', 'lectura silábica'). Breve.",
            },
            interpretacion: {
              type: "string",
              description: "2-3 oraciones que INTERPRETAN qué significa ese desempeño para el aprendizaje (NO repitas el número): qué habilidad subyacente está en juego y cómo se relaciona con lo esperado para su grado.",
            },
          },
          required: ["proceso", "nivel", "datoClave", "interpretacion"],
        },
        description: "Un objeto por CADA proceso evaluado (lectura, comprensión, cognitivo, léxico, escritura; y psicomotricidad si se aplicó BPM). Da profundidad explicando el porqué de cada resultado.",
      },
      hallazgosPorEjercicio: {
        type: "array",
        items: {
          type: "object",
          properties: {
            ejercicio: {
              type: "string",
              description: "Ejercicio del instrumento (ej: 'Ej. 12 — Sustitución de fonemas', 'Ej. 1 — Comprensión lectora').",
            },
            resultado: {
              type: "string",
              enum: ["Logrado", "Parcial", "No logrado"],
            },
            queRevela: {
              type: "string",
              description: "1-2 oraciones sobre qué habilidad subyacente revela ese resultado específico y por qué importa para leer/escribir.",
            },
          },
          required: ["ejercicio", "resultado", "queRevela"],
        },
        description: "Interpretación ítem por ítem de los ejercicios MÁS informativos: los de mayor logro (fortalezas) y los de mayor dificultad. Máx. 8. Ayuda al/la docente a saber exactamente dónde intervenir.",
      },
      fortalezas: {
        type: "array",
        items: { type: "string" },
        description: "Máx. 4 fortalezas CONCRETAS observadas (no genéricas). Cada una empieza con verbo activo: 'Lee con...', 'Comprende...', 'Demuestra...'. Tono celebrador.",
      },
      areasDeMejora: {
        type: "array",
        items: {
          type: "object",
          properties: {
            area: {
              type: "string",
              description: "Nombre del área en términos POSITIVOS (ej: 'Fluidez lectora en desarrollo' en vez de 'Lentitud lectora').",
            },
            descripcion: {
              type: "string",
              description: "1-2 oraciones describiendo el área como oportunidad de aprendizaje (no como déficit). Tono constructivo.",
            },
            brechaConCurriculo: {
              type: "string",
              description: "1 oración con la habilidad específica del currículo R.M. 1040/2022 que se está construyendo (no 'no logra' sino 'en camino hacia...').",
            },
            prioridad: {
              type: "string",
              enum: ["alta", "media", "baja"],
            },
          },
          required: ["area", "descripcion", "brechaConCurriculo", "prioridad"],
        },
        description: "Máx. 4 áreas en construcción",
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
                  description: "Categoría aplicada: Entrada y anticipación | Organización espacial | Ritmo y tiempo | Praxia global | Imitación y gestos | Praxia fina/escritura | Lateralidad | Clima emocional | Lectura | Conciencia fonológica | Comprensión lectora | Producción escrita",
                },
                titulo: {
                  type: "string",
                  description: "Título corto y motivador de la estrategia (4-7 palabras).",
                },
                descripcion: {
                  type: "string",
                  description: "1-2 oraciones con la actividad CONCRETA (qué hace el docente, qué materiales usa, qué se espera). Basado en ZDP de Vygotsky y andamiaje de Bruner.",
                },
                frecuencia: {
                  type: ["string", "null"],
                  description: "Ej: '5-10 min, 2-3 veces/día' o '15 min diarios al inicio de clase'",
                },
              },
              required: ["categoria", "titulo", "descripcion"],
            },
            description: "Máx. 8 estrategias aplicables ya. Concretas, no genéricas. Cubre los distintos procesos con dificultad.",
          },
          paraLaFamilia: {
            type: "array",
            items: {
              type: "object",
              properties: {
                titulo: {
                  type: "string",
                  description: "Título cálido y motivador (no técnico). Ej: 'Lectura compartida antes de dormir' en vez de 'Estimulación fonológica'.",
                },
                descripcion: {
                  type: "string",
                  description: "1-2 oraciones en lenguaje SIMPLE para padres/madres. Sin jerga técnica. Énfasis en el VÍNCULO afectivo + actividad concreta.",
                },
              },
              required: ["titulo", "descripcion"],
            },
            description: "Máx. 5 sugerencias para casa, en lenguaje accesible para padres.",
          },
          derivacion: {
            type: "object",
            properties: {
              necesaria: { type: "boolean" },
              especialista: {
                type: ["string", "null"],
                description: "psicopedagogo | fonoaudiólogo | psicólogo | terapeuta ocupacional | null",
              },
              justificacion: {
                type: ["string", "null"],
                description: "Si necesaria=true, 1-2 oraciones SERENAS explicando POR QUÉ se beneficiaría de valoración complementaria. Encuadrar como complemento al trabajo del docente, no como problema grave.",
              },
            },
            required: ["necesaria", "especialista", "justificacion"],
          },
          recursosSugeridos: {
            type: "array",
            items: { type: "string" },
            description:
              "Máx. 5 recursos y materiales concretos y de bajo costo para implementar las estrategias (juegos, tarjetas, láminas, apps, textos, canciones). Realistas para una U.E. boliviana.",
          },
        },
        required: ["paraElAula", "paraLaFamilia", "derivacion", "recursosSugeridos"],
      },
      planSeguimiento: {
        type: "object",
        properties: {
          periodoRevaluacion: {
            type: "string",
            description: "Plazo razonable según severidad. sin-dificultades: '6 meses' | leve: '3 meses' | moderada: '2-3 meses' | severa: '4-6 semanas con monitoreo'.",
          },
          indicadoresProgreso: {
            type: "array",
            items: { type: "string" },
            description: "Máx. 3 indicadores MEDIBLES y observables en aula. Cada uno con verbo concreto: 'Lee X palabras/min', 'Identifica Y de Z fonemas', etc.",
          },
        },
        required: ["periodoRevaluacion", "indicadoresProgreso"],
      },
    },
    required: [
      "sintesisEjecutiva",
      "perfilDAE",
      "analisisPorProceso",
      "hallazgosPorEjercicio",
      "perfilPsicomotor",
      "perfilIntegrado",
      "fortalezas",
      "areasDeMejora",
      "recomendaciones",
      "planSeguimiento",
    ],
  },
}
