import { Estudiante, Evaluacion } from "@prisma/client"
import { AllScores } from "@/types/scoring"

function pct(val: number, max: number) {
  return max > 0 ? `${val}/${max} (${Math.round((val / max) * 100)}%)` : `${val}/${max}`
}

function scaleName(v: string) {
  return { S: "Siempre", CS: "Casi Siempre", AV: "A veces", N: "Nunca" }[v] ?? v
}

function perfilLabel(p: string) {
  return {
    "apráxico": "Débil (apráxico)",
    "dispráxico": "Satisfactorio (dispráxico)",
    "eupráxico": "Bueno (eupráxico)",
    "hiperpráxico": "Excelente (hiperpráxico)",
  }[p] ?? p
}

function getExpectativasCurriculares(anio: number): string {
  if (anio === 0) return "Año de escolaridad no identificado."
  const edadEsperada = 5 + anio
  const expectativas: Record<number, string> = {
    1: `PRIMER AÑO (edad esperada: ~${edadEsperada} años)\nComunicación oral: Expresa experiencias y emociones usando normas de cortesía.\nLectura: Comprende textos literarios y no literarios relacionándolos con experiencias propias.\nEscritura: Escribe textos usando código alfabético considerando destinatario y propósito.\nCognitivo esperado: Nombra y describe objetos, sigue instrucciones simples, clasifica por categorías, orientación espacial básica, secuencias temporales.\nLéxico esperado: Identifica sonidos iniciales, produce rimas simples, reconoce patrones sonoros.`,
    2: `SEGUNDO AÑO (edad esperada: ~${edadEsperada} años)\nComunicación oral: Interactúa expresando ideas, respetando turnos.\nLectura: Lee 60-84 palabras/min con precisión y expresividad. Comprende textos con oraciones simples.\nEscritura: Escribe textos literarios y no literarios de manera organizada.\nCognitivo esperado: Nombra y explica uso de objetos, instrucciones de dos pasos, clasifica imágenes, asociaciones verbo-objeto, secuencias temporales.\nLéxico esperado: Produce y reconoce rimas, sustituye fonemas simples, identifica omisiones.`,
    3: `TERCER AÑO (edad esperada: ~${edadEsperada} años)\nComunicación oral: Expresa ideas de manera coherente y articulada según propósito y contexto.\nLectura: Lee con fluidez. Interpreta textos determinando consecuencias, comparando personajes, reconociendo problema/solución.\nEscritura: Escribe con secuencia lógica, estructura, conectores, descripciones y diálogo.\nCognitivo esperado: Análisis y síntesis concretos, inferencias básicas, causa-consecuencia.\nLéxico esperado: Rimas con fluidez, sustitución y omisión de fonemas con precisión, inversiones silábicas.`,
    4: `CUARTO AÑO (edad esperada: ~${edadEsperada} años)\nComunicación oral: Interactúa fundamentando ideas con respeto.\nLectura: Hace inferencias, identifica acciones principales, describe ambiente, relaciona intención del autor, compara textos.\nEscritura: Secuencia lógica (inicio-desarrollo-desenlace), conectores, vocabulario pertinente.\nCognitivo esperado: Abstracción y generalización, lenguaje figurado, razonamiento lógico, inferencias complejas.\nLéxico esperado: Conciencia fonológica avanzada: sustitución, omisión e inversión con precisión.`,
    5: `QUINTO AÑO (edad esperada: ~${edadEsperada} años)\nComunicación oral: Fundamenta ideas desde escucha activa y empatía.\nLectura: Identifica idea central, interpreta lenguaje figurado, deduce características de personajes, compara textos.\nEscritura: Estructura con idea central por párrafo, vocabulario pertinente.\nCognitivo esperado: Pensamiento abstracto consolidado, razonamiento hipotético, análisis crítico.\nLéxico esperado: Conciencia fonológica y morfológica consolidada, vocabulario amplio.`,
    6: `SEXTO AÑO (edad esperada: ~${edadEsperada} años)\nComunicación oral: Fundamenta ideas, regula participación, crea consensos.\nLectura: Inferencias complejas, idea central, lenguaje figurado, conclusiones sustentadas.\nEscritura: Idea central por párrafo, vocabulario pertinente, investigación propia.\nCognitivo esperado: Pensamiento crítico complejo, argumentación con evidencia, metacognición.\nLéxico esperado: Dominio fonológico completo, vocabulario activo y pasivo amplio.`,
  }
  return expectativas[anio] ?? "Año de escolaridad fuera del rango primario (1-6)."
}

export function buildAnalysisPrompt(
  estudiante: Estudiante,
  ev: Evaluacion,
  scores: AllScores
): string {
  const esFemenino = estudiante.sexo === "Femenino"
  const elLa = esFemenino ? "la" : "el"
  const estudianteLabel = esFemenino ? "la estudiante" : "el estudiante"

  const edad = (ev as Evaluacion & { edadAlEvaluar?: number | null }).edadAlEvaluar
  const anioEscolar = (ev as Evaluacion & { anioEscolar?: number | null }).anioEscolar ?? 0
  const edadEsperada = anioEscolar > 0 ? 5 + anioEscolar : null
  const diferenciaEdad = (edad != null && edadEsperada != null) ? edad - edadEsperada : null

  const notaEdad = edad == null
    ? "no registrada"
    : diferenciaEdad === null
      ? `${edad} años`
      : diferenciaEdad === 0
        ? `${edad} años (acorde al grado)`
        : diferenciaEdad > 0
          ? `${edad} años — ${diferenciaEdad} año(s) mayor de lo esperado (posible repitencia o ingreso tardío)`
          : `${edad} años — ${Math.abs(diferenciaEdad)} año(s) menor de lo esperado (ingreso temprano)`

  const expectativas = getExpectativasCurriculares(anioEscolar)

  // BPM section (only if applied)
  let bpmSection = ""
  if (scores.bpm.applied) {
    const b = scores.bpm
    bpmSection = `

## RESULTADOS DE LA BATERÍA PSICOMOTORA (BPM — Da Fonseca)

### 1ª UNIDAD FUNCIONAL
- **Tonicidad**: ${b.tonicidad.score.toFixed(1)}/4 — Perfil ${perfilLabel(b.tonicidad.perfil)}
  Inspiración: ${b.tonicidad.items.inspiracion ?? "—"}, Espiración: ${b.tonicidad.items.espiracion ?? "—"}, Apnea: ${b.tonicidad.items.apnea ?? "—"}
  Fatigabilidad: ${b.tonicidad.items.fatigabilidad ?? "—"}, Extensibilidad MI: ${b.tonicidad.items.extensibilidadMI ?? "—"}, MS: ${b.tonicidad.items.extensibilidadMS ?? "—"}
  Pasividad: ${b.tonicidad.items.pasividad ?? "—"}, Paratonía MI: ${b.tonicidad.items.paratoniaMI ?? "—"}, MS: ${b.tonicidad.items.paratoniaMS ?? "—"}
  Diadococinesias MD: ${b.tonicidad.items.diadocMD ?? "—"}, MI: ${b.tonicidad.items.diadocMI ?? "—"}
  Sincinesias bucales: ${b.tonicidad.items.sincinBucales ?? "—"}, contralaterales: ${b.tonicidad.items.sincinContralat ?? "—"}

- **Equilibrio**: ${b.equilibrio.score.toFixed(1)}/4 — Perfil ${perfilLabel(b.equilibrio.perfil)}
  Inamovilidad: ${b.equilibrio.items.inamovilidad ?? "—"}
  Estático — Apoyo rectilíneo: ${b.equilibrio.items.apoyoRect ?? "—"}, Punta pies: ${b.equilibrio.items.puntaPies ?? "—"}, Un pie: ${b.equilibrio.items.apoyoUnPie ?? "—"}
  Dinámico — Marcha: ${b.equilibrio.items.marchaControl ?? "—"}, Banco adelante: ${b.equilibrio.items.bancoAdelante ?? "—"}, atrás: ${b.equilibrio.items.bancoAtras ?? "—"}, derecho: ${b.equilibrio.items.bancoDerecho ?? "—"}, izquierdo: ${b.equilibrio.items.bancoIzquierdo ?? "—"}
  Saltos — Pie cojo izq: ${b.equilibrio.items.pieCojoIzq ?? "—"}, der: ${b.equilibrio.items.piecojoDer ?? "—"}, Pies juntos adel: ${b.equilibrio.items.piesJuntosAdel ?? "—"}, atrás: ${b.equilibrio.items.piesJuntosAtras ?? "—"}, ojos cerrados: ${b.equilibrio.items.piesJuntosOjosCerr ?? "—"}

### 2ª UNIDAD FUNCIONAL
- **Lateralidad**: ${b.lateralidad.tipo} (${b.lateralidad.definida ? "definida" : "no definida"})
  Ocular: ${b.lateralidad.ocular ?? "—"}, Auditiva: ${b.lateralidad.auditiva ?? "—"}, Manual: ${b.lateralidad.manual ?? "—"}, Pedal: ${b.lateralidad.pedal ?? "—"}
  Innata: ${b.lateralidad.innata ?? "—"}, Adquirida: ${b.lateralidad.adquirida ?? "—"}

- **Noción del Cuerpo**: ${b.nocionCuerpo.score.toFixed(1)}/4 — Perfil ${perfilLabel(b.nocionCuerpo.perfil)}
  Sentido kinestésico: ${b.nocionCuerpo.items.sentidoKinest ?? "—"}, Reconocimiento I/D: ${b.nocionCuerpo.items.reconocimientoID ?? "—"}
  Autoimagen (cara): ${b.nocionCuerpo.items.autoimagenCara ?? "—"}, Imitación gestos: ${b.nocionCuerpo.items.imitacionGestos ?? "—"}, Dibujo cuerpo: ${b.nocionCuerpo.items.dibujoCuerpo ?? "—"}

- **Estructuración Espacio-Temporal**: ${b.estructuracionET.score.toFixed(1)}/4 — Perfil ${perfilLabel(b.estructuracionET.perfil)}
  Organización: ${b.estructuracionET.items.organizacion ?? "—"}, Estr. dinámica: ${b.estructuracionET.items.estructDinamica ?? "—"}
  Rep. topográfica: ${b.estructuracionET.items.repTopografica ?? "—"}, Estr. rítmica: ${b.estructuracionET.items.estructRitmica ?? "—"}

### 3ª UNIDAD FUNCIONAL
- **Praxia Global**: ${b.praxiaGlobal.score.toFixed(1)}/4 — Perfil ${perfilLabel(b.praxiaGlobal.perfil)}
  Coord. óculo-manual: ${b.praxiaGlobal.items.coordOculoManual ?? "—"}, óculo-podal: ${b.praxiaGlobal.items.coordOculoPodal ?? "—"}
  Dismetría: ${b.praxiaGlobal.items.dismetria ?? "—"}, Disociación: ${b.praxiaGlobal.items.disociacion ?? "—"}
  MS: ${b.praxiaGlobal.items.ms ?? "—"}, MI: ${b.praxiaGlobal.items.mi ?? "—"}, Agilidades: ${b.praxiaGlobal.items.agilidades ?? "—"}

- **Praxia Fina**: ${b.praxiaFina.score.toFixed(1)}/4 — Perfil ${perfilLabel(b.praxiaFina.perfil)}
  Coord. dinámica manual: ${b.praxiaFina.items.coordDinamManual ?? "—"}, Tamborilear: ${b.praxiaFina.items.tamborilear ?? "—"}, Velocidad-precisión: ${b.praxiaFina.items.velocidadPrecision ?? "—"}

### PERFIL GENERAL BPM: ${b.promedioGeneral.toFixed(1)}/4 — ${perfilLabel(b.perfilGeneral)}`
  }

  const bpmJsonInstructions = scores.bpm.applied ? `
  "perfilPsicomotor": {
    "resumen": "Síntesis descriptiva del perfil psicomotor global (3-5 oraciones). NO es un diagnóstico, es una descripción profesional del perfil observado.",
    "tonoControlPostural": "Descripción del tono muscular, control postural, seguridad gravitatoria",
    "lateralidad": "Descripción de la lateralidad: si está definida o no, tipo, implicaciones para tareas bilaterales y orientación",
    "esquemaCorporal": "Noción del cuerpo, somatognosia, componente kinestésico, imitación, dibujo del cuerpo",
    "estructuracionEspacioTemporal": "Ritmo, sucesión, relaciones espaciales, impacto en juegos secuenciales y nociones topológicas",
    "praxiaGlobal": "Dismetría, dispraxia, planificación motora, cálculo de distancias y trayectorias",
    "praxiaFina": "Micromotricidad, pinza, disociación digital, trazo, velocidad y fatiga en actividades de detalle",
    "perfilGeneral": "Clasificación general: apráxico/dispráxico/eupráxico/hiperpráxico"
  },
  "perfilIntegrado": {
    "resumen": "Síntesis integradora de 4-6 oraciones que conecte ambos perfiles. Explica cómo ${elLa} estudiante 'entiende el qué pero le falla el cómo en el tiempo y el espacio' (si aplica). Describe bajo qué condiciones gana o pierde eficacia.",
    "relacionPMconDAE": "Cómo el perfil psicomotor se encadena con las dificultades de lecto-escritura. Ejemplo: la estructuración espacio-temporal débil impacta secuencias fonológicas.",
    "tiempoYOrden": "Sin 'pulso temporal' interno, armar la cadena grafema-fonema es más costoso. Secuencias motoras inestables → errores de orden al copiar.",
    "espacioYOrientacion": "Dismetría + lateralidad no definida → problemas de orientación izq-der, márgenes, linealidad.",
    "praxiaYEscritura": "Micromotricidad inmadura → trazo lento, irregular, que compite con la idea que quiere plasmar.",
    "atencionMemoria": "Necesita varios intentos para aprender gestos → misma lentitud en automatizar reglas ortográficas y correspondencias letra-sonido."
  },` : `
  "perfilPsicomotor": null,
  "perfilIntegrado": null,`

  return `Eres un/a psicopedagogo/a especialista en dificultades de aprendizaje y desarrollo integral en el contexto educativo boliviano.
Analiza los resultados de ${estudianteLabel} evaluado/a con:
1. El "Instrumento para la Detección y Evaluación de las Dificultades en el Aprendizaje de Lecto-Escritura" del Ministerio de Educación del Estado Plurinacional de Bolivia (2012)
${scores.bpm.applied ? '2. La Batería Psicomotora (BPM) de Víctor da Fonseca (1975)' : ''}
Cruza los resultados con las expectativas del currículo oficial boliviano (Planes y Programas EPCV, R.M. 1040/2022).

## DATOS DEL ESTUDIANTE
- Nombre: ${estudiante.nombre} ${estudiante.apellido1} ${estudiante.apellido2 ?? ""}
- Sexo: ${estudiante.sexo}
- Edad al momento de la evaluación: ${notaEdad}
- Año de escolaridad: ${anioEscolar > 0 ? `${anioEscolar}° año` : "no registrado"} (${estudiante.grado})
- U.E.: ${estudiante.unidadEducativa}
- Fecha de evaluación: ${new Date(ev.fecha).toLocaleDateString("es-BO")}
- Evaluador: ${ev.evaluador}

## EXPECTATIVAS CURRICULARES (R.M. 1040/2022)
${expectativas}

## RESULTADOS DEL INSTRUMENTO DE LECTO-ESCRITURA (MINEDU 2012)

### 1. LECTURA EN VOZ ALTA
- Tono de voz: ${ev.tonoVoz}
- Expresión emocional: ${ev.expresionMatices}/4
- Tipo de lectura: ${scores.lectura.tipoLectura}
- Errores (${scores.lectura.erroresCount}/8): ${scores.lectura.erroresPresentes.join(", ") || "Ninguno"}
- Comprensión lectora: ${pct(scores.lectura.comprensionTotal, 15)}
  Memoriza: ${scaleName(ev.compMemoriza)} | Ideas: ${scaleName(ev.compIdeas)} | Valora: ${scaleName(ev.compValora)} | Interpreta: ${scaleName(ev.compInterpreta)} | Asocia: ${scaleName(ev.compAsocia)}
- RESULTADO: ${scores.lectura.hasDifficulty ? "PRESENTA DIFICULTADES" : "Sin dificultades significativas"}

### 2. PROCESOS COGNITIVOS (Ítems 3-10) — ${pct(scores.cognitivo.totalCorrect, scores.cognitivo.totalItems)}
- Nombrar objetos (3A): ${pct(scores.cognitivo.byItem.item3a, 3)} | Explicar uso (3B): ${pct(scores.cognitivo.byItem.item3b, 3)}
- Instrucciones (4): ${pct(scores.cognitivo.byItem.item4, 2)} | Clasificar (5A): ${pct(scores.cognitivo.byItem.item5a, 3)} | Día/Noche (5B): ${pct(scores.cognitivo.byItem.item5b, 1)}
- Orientación espacial (6): ${pct(scores.cognitivo.byItem.item6, 3)} | Secuencia (7): ${pct(scores.cognitivo.byItem.item7, 1)}
- Asociación (8): ${pct(scores.cognitivo.byItem.item8, 4)} | Anagramas (9): ${pct(scores.cognitivo.byItem.item9, 4)} | Inferencia (10): ${pct(scores.cognitivo.byItem.item10, 3)}
- RESULTADO: ${scores.cognitivo.hasDifficulty ? "DIFICULTADES en procesos de pensamiento" : "Sin dificultades cognitivas"}

### 3. PROCESOS LÉXICOS (Ítems 11-14) — ${pct(scores.lexical.totalCorrect, scores.lexical.totalItems)}
- Rimas (11A): ${pct(scores.lexical.byItem.item11a, 4)} | No-rima (11B): ${pct(scores.lexical.byItem.item11b, 4)}
- Sustitución (12): ${pct(scores.lexical.byItem.item12, 3)} | Omisión (13): ${pct(scores.lexical.byItem.item13, 3)} | Inversión (14): ${pct(scores.lexical.byItem.item14, 3)}
- RESULTADO: ${scores.lexical.hasDifficulty ? "DIFICULTADES léxicas" : "Sin dificultades léxicas"}

### 4. ESCRITURA — DICTADO (Ej. 15)
- Errores expresión escrita: ${scores.dictado.errorScore}/18 | Caligrafía: ${scores.dictado.caligrafia}/6
- Coherencia: ${scores.dictado.coherencia}/10 | Producción: ${scores.dictado.produccion}/18
- RESULTADO: ${scores.dictado.hasDifficulty ? "DIFICULTADES en dictado" : "Escritura adecuada"}

### 5. ESCRITURA — COMPOSICIÓN (Ej. 16)
- Errores expresión escrita: ${scores.composicion.errorScore}/18 | Caligrafía: ${scores.composicion.caligrafia}/6
- Coherencia: ${scores.composicion.coherencia}/10 | Producción: ${scores.composicion.produccion}/18
- RESULTADO: ${scores.composicion.hasDifficulty ? "DIFICULTADES en composición" : "Composición adecuada"}

### ESTADO GENERAL: ${scores.estadoGeneral.toUpperCase()}
Áreas con dificultad: ${scores.areasDificultad.length > 0 ? scores.areasDificultad.join(", ") : "Ninguna"}
${bpmSection}

---

Genera un informe psicopedagógico integral, profesional, empático y orientado a la acción.
Usa lenguaje inclusivo referido a ${estudianteLabel} (${estudiante.sexo === "Femenino" ? "ella" : "él"}).
${scores.bpm.applied ? "IMPORTANTE: Integra ambos instrumentos (lecto-escritura Y BPM) en un análisis cruzado." : "Nota: No se aplicó la BPM, genera el perfil solo con el instrumento de lecto-escritura."}

Responde ÚNICAMENTE con JSON válido (sin texto antes ni después):

{
  "perfilDAE": {
    "resumen": "Párrafo de 3-5 oraciones describiendo el perfil de DAE en lecto-escritura. Menciona si lee/escribe o no, si los procesos psíquicos y léxicos son inmaduros para su edad, y cuántos años de desfase respecto al currículo de su grado.",
    "nivelDificultad": "sin-dificultades | dificultad-leve | dificultad-moderada | dificultad-severa",
    "areasAfectadas": ["array de áreas"],
    "relacionEdadGrado": "Relación entre la edad y el grado, si hay desfase y qué implica",
    "desfaseAnios": null
  },
${bpmJsonInstructions}
  "fortalezas": [
    "Fortaleza 1 observada en relación a las expectativas del grado",
    "Fortaleza 2"
  ],
  "areasDeMejora": [
    {
      "area": "Nombre del área",
      "descripcion": "Descripción específica comparando con lo esperado para el grado",
      "brechaConCurriculo": "Qué habilidades del currículo R.M. 1040/2022 no se están logrando",
      "prioridad": "alta | media | baja"
    }
  ],
  "recomendaciones": {
    "paraElAula": [
      {
        "categoria": "Ejemplo: Entrada y anticipación | Organización espacial | Ritmo y tiempo | Praxia global | Imitación y gestos | Praxia fina/escritura | Lateralidad | Clima emocional | Lectura | Conciencia fonológica",
        "titulo": "Título de la estrategia",
        "descripcion": "Descripción detallada y práctica, en ráfagas breves de 5-10 min, 2-3 veces al día",
        "frecuencia": "Ejemplo: 5-10 min, 2-3 veces/día"
      }
    ],
    "paraLaFamilia": [
      {
        "titulo": "Actividad en casa",
        "descripcion": "Descripción simple y accesible para padres o tutores"
      }
    ],
    "derivacion": {
      "necesaria": true,
      "especialista": "psicopedagogo | fonoaudiólogo | psicólogo | terapeuta ocupacional",
      "justificacion": "Justificación profesional de la derivación"
    }
  },
  "planSeguimiento": {
    "periodoRevaluacion": "Ejemplo: 3 meses",
    "indicadoresProgreso": [
      "Indicador medible alineado a expectativas del grado"
    ]
  }
}

Para nivelDificultad usa exactamente: "sin-dificultades", "dificultad-leve", "dificultad-moderada", "dificultad-severa".
Para prioridad usa: "alta", "media", "baja".
Para especialista usa: "psicopedagogo", "fonoaudiólogo", "psicólogo", "terapeuta ocupacional", o null.`
}
