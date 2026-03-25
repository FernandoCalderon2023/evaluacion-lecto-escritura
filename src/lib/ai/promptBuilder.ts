import { Estudiante, Evaluacion } from "@prisma/client"
import { AllScores } from "@/types/scoring"

function pct(val: number, max: number) {
  return `${val}/${max} (${Math.round((val / max) * 100)}%)`
}

function scaleName(v: string) {
  return { S: "Siempre", CS: "Casi Siempre", AV: "A veces", N: "Nunca" }[v] ?? v
}

/**
 * Expectativas curriculares por año de escolaridad.
 * Fuente: Planes y Programas EPCV, R.M. 1040/2022 – Ministerio de Educación Bolivia.
 */
function getExpectativasCurriculares(anio: number): string {
  if (anio === 0) return "Año de escolaridad no identificado."

  const edadEsperada = 5 + anio // 1ro=6, 2do=7, etc.

  const expectativas: Record<number, string> = {
    1: `PRIMER AÑO DE ESCOLARIDAD (edad esperada: ~${edadEsperada} años)
Comunicación oral: Expresa experiencias y emociones de manera coherente usando normas de cortesía, recursos no verbales y paraverbales en LC/LO/LE.
Lectura comprensiva: Comprende textos literarios y no literarios relacionándolos con sus propias experiencias; extrae información explícita e implícita sobre aspectos del texto.
Escritura creativa: Escribe textos usando el código alfabético, considerando destinatario y propósito comunicativo.
Procesos cognitivos esperados: Nombra y describe objetos del entorno; sigue instrucciones simples; clasifica objetos por categorías; reconoce orientación espacial básica; establece secuencias temporales sencillas.
Procesos léxicos esperados: Identifica sonidos iniciales de palabras; produce rimas simples; reconoce patrones sonoros básicos.`,

    2: `SEGUNDO AÑO DE ESCOLARIDAD (edad esperada: ~${edadEsperada} años)
Comunicación oral: Interactúa en situaciones comunicativas expresando sus ideas, demostrando interés y respetando la opinión del otro y los turnos de participación.
Lectura comprensiva: Lee en voz alta textos en cantidad de 60 a 84 palabras por minuto, con precisión y expresividad adecuada. Lee y comprende textos literarios y no literarios con oraciones simples detectando ideas centrales e información explícita e implícita.
Escritura creativa: Escribe creativamente textos literarios y no literarios de manera organizada y consecuente considerando el contenido, propósito comunicativo y destinatario.
Procesos cognitivos esperados: Nombra objetos y explica su uso; sigue instrucciones de dos pasos; clasifica imágenes en categorías; realiza asociaciones verbo-objeto; reconoce secuencias temporales.
Procesos léxicos esperados: Produce y reconoce rimas; sustituye fonemas simples; identifica omisiones de sonidos.`,

    3: `TERCER AÑO DE ESCOLARIDAD (edad esperada: ~${edadEsperada} años)
Comunicación oral: Expresa oralmente ideas y emociones de manera coherente y articulada de acuerdo con el propósito comunicativo, el contexto y características del texto, utilizando recursos no verbales y paraverbales.
Lectura comprensiva: Lee en voz alta con fluidez. Interpreta textos literarios y no literarios determinando las consecuencias de hechos o acciones, comparando personajes, reconociendo el problema y la solución en una narración, fundamentando su opinión con información del texto y su experiencia.
Escritura creativa: Escribe creativamente textos literarios y no literarios considerando el destinatario, propósito, tomando en cuenta la secuencia lógica, estructura, uso de conectores adecuados, incluyendo descripciones y diálogo para desarrollar la trama.
Procesos cognitivos esperados: Opera con análisis y síntesis en situaciones concretas; realiza inferencias básicas; comprende relaciones de causa-consecuencia; usa vocabulario para explicar conceptos.
Procesos léxicos esperados: Produce rimas con fluidez; sustituye y omite fonemas con precisión; realiza inversiones silábicas simples.`,

    4: `CUARTO AÑO DE ESCOLARIDAD (edad esperada: ~${edadEsperada} años)
Comunicación oral: Expresa oralmente ideas y emociones de manera coherente y articulada, interactúa para compartir ideas demostrando respeto y fundamentando sus ideas.
Lectura comprensiva: Interpreta textos literarios y no literarios haciendo inferencias a partir de la información del texto y de sus experiencias y conocimiento, identificando las acciones principales del relato, describiendo el ambiente y las costumbres, relacionando la intención del autor, información de tablas, mapas o diagramas, comparando información entre dos textos sobre el mismo tema, llegando a conclusiones.
Escritura creativa: Escribe creativamente textos literarios y no literarios con secuencia lógica de eventos (inicio, desarrollo y desenlace), conectores adecuados, descripción y diálogo para desarrollar la trama, vocabulario pertinente.
Procesos cognitivos esperados: Abstracción y generalización; comprende y usa el lenguaje figurado en contextos; razonamiento lógico en situaciones cotidianas; inferencias complejas.
Procesos léxicos esperados: Maneja conciencia fonológica avanzada: sustitución, omisión e inversión de fonemas y sílabas con precisión.`,

    5: `QUINTO AÑO DE ESCOLARIDAD (edad esperada: ~${edadEsperada} años)
Comunicación oral: Expresa oralmente ideas y emociones de manera coherente, interactúa en situaciones comunicativas demostrando empatía, fundamenta sus ideas desde actitudes de escucha activa.
Lectura comprensiva: Interpreta textos literarios y no literarios haciendo inferencias a partir de la información del texto y sus experiencias, identificando la idea central, interpretando el lenguaje figurado, deduciendo las características de los personajes, relacionando información de imágenes, gráficos, comparando información entre dos textos, llegando a conclusiones sustentadas en la información del texto.
Escritura creativa: Escribe creativamente textos literarios y no literarios considerando el destinatario, propósito, organizando el contenido en una estructura con idea central por cada párrafo, incorporando vocabulario pertinente.
Procesos cognitivos esperados: Pensamiento abstracto consolidado; razonamiento hipotético; análisis crítico de información; uso estratégico del lenguaje.
Procesos léxicos esperados: Conciencia fonológica y morfológica consolidada; manejo de vocabulario amplio y preciso.`,

    6: `SEXTO AÑO DE ESCOLARIDAD (edad esperada: ~${edadEsperada} años)
Comunicación oral: Interactúa en situaciones comunicativas expresando sus ideas demostrando respeto, fundamentando sus ideas, regulando su participación desde la escucha activa en la creación de consensos.
Lectura comprensiva: Interpreta textos literarios y no literarios, haciendo inferencias a partir de la información del texto y de sus experiencias y conocimiento, identificando la idea central, interpretando el lenguaje figurado, deduciendo las características de los personajes, relacionando la información de imágenes, gráficos, comparando información entre dos textos sobre el mismo tema, llegando a conclusiones sustentadas en la información del texto.
Escritura creativa: Escribe creativamente textos literarios y no literarios, considerando el destinatario, propósito, organizando el contenido en una estructura, desarrollando una idea central por cada párrafo, incorporando un vocabulario pertinente, a partir de sus conocimientos e investigación.
Procesos cognitivos esperados: Pensamiento crítico complejo; argumentación con evidencia; producción de conocimiento propio con estructura; metacognición.
Procesos léxicos esperados: Dominio fonológico completo; amplio vocabulario activo y pasivo; comprensión de estructuras morfológicas complejas.`,
  }

  return expectativas[anio] ?? "Año de escolaridad fuera del rango primario (1-6)."
}

export function buildAnalysisPrompt(
  estudiante: Estudiante,
  ev: Evaluacion,
  scores: AllScores
): string {
  // Datos ingresados explícitamente por el evaluador
  const edad = (ev as Evaluacion & { edadAlEvaluar?: number | null }).edadAlEvaluar
  const anioEscolar = (ev as Evaluacion & { anioEscolar?: number | null }).anioEscolar ?? 0

  const edadEsperadaParaGrado = anioEscolar > 0 ? 5 + anioEscolar : null
  const diferenciaEdad = (edad != null && edadEsperadaParaGrado != null)
    ? edad - edadEsperadaParaGrado
    : null

  const notaEdad = edad == null
    ? "edad no registrada"
    : diferenciaEdad === null
      ? `${edad} años (año escolar no registrado)`
      : diferenciaEdad === 0
        ? `${edad} años (acorde al grado)`
        : diferenciaEdad > 0
          ? `${edad} años — ${diferenciaEdad} año(s) mayor de lo esperado para su grado (posible repitencia o ingreso tardío)`
          : `${edad} años — ${Math.abs(diferenciaEdad)} año(s) menor de lo esperado para su grado (ingreso temprano)`

  const expectativas = getExpectativasCurriculares(anioEscolar)

  return `Eres un psicopedagogo especialista en dificultades de aprendizaje de lectura y escritura en Bolivia.
Analiza los resultados de la siguiente evaluación aplicada con el "Instrumento para la Detección y Evaluación de las Dificultades en el Aprendizaje de Lecto-Escritura" del Ministerio de Educación del Estado Plurinacional de Bolivia (2012).
Cruza los resultados con las expectativas del currículo oficial boliviano (Planes y Programas EPCV, R.M. 1040/2022).

## DATOS DEL ESTUDIANTE
- Nombre: ${estudiante.nombre} ${estudiante.apellido1} ${estudiante.apellido2 ?? ""}
- Edad al momento de la evaluación: ${notaEdad}
- Año de escolaridad: ${anioEscolar > 0 ? `${anioEscolar}° año (${estudiante.grado})` : `no registrado (${estudiante.grado})`}
- Año de gestión: ${estudiante.gestion}
- Fecha de evaluación: ${new Date(ev.fecha).toLocaleDateString("es-BO")}
- Evaluador: ${ev.evaluador}

## EXPECTATIVAS CURRICULARES SEGÚN GRADO (R.M. 1040/2022)
${expectativas}

## RESULTADOS DE LA EVALUACIÓN (Instrumento de Detección 2012)

### 1. LECTURA EN VOZ ALTA
- Tono de voz: ${ev.tonoVoz}
- Expresión emocional (1-4): ${ev.expresionMatices}/4
- Tipo de lectura: ${scores.lectura.tipoLectura}
- Errores presentes (${scores.lectura.erroresCount}/8): ${scores.lectura.erroresPresentes.join(", ") || "Ninguno"}
- Comprensión lectora: ${pct(scores.lectura.comprensionTotal, 15)}
  • Memoriza aspectos significativos: ${scaleName(ev.compMemoriza)}
  • Ideas centrales y secundarias: ${scaleName(ev.compIdeas)}
  • Valora el texto: ${scaleName(ev.compValora)}
  • Interpreta: ${scaleName(ev.compInterpreta)}
  • Asocia con contextos: ${scaleName(ev.compAsocia)}
- RESULTADO: ${scores.lectura.hasDifficulty ? "⚠️ PRESENTA DIFICULTADES" : "✅ Sin dificultades significativas"}

### 2. PROCESOS COGNITIVOS (Ítems 3-10) — ${pct(scores.cognitivo.totalCorrect, 27)}
- Nombrar objetos (3A): ${pct(scores.cognitivo.byItem.item3a, 3)}
- Explicar uso de objetos (3B): ${pct(scores.cognitivo.byItem.item3b, 3)}
- Seguir instrucciones (4): ${pct(scores.cognitivo.byItem.item4, 2)}
- Clasificar imágenes (5A): ${pct(scores.cognitivo.byItem.item5a, 3)}
- Instrucción día/noche (5B): ${pct(scores.cognitivo.byItem.item5b, 1)}
- Orientación espacial (6): ${pct(scores.cognitivo.byItem.item6, 3)}
- Secuencia temporal (7): ${pct(scores.cognitivo.byItem.item7, 1)}
- Asociación verbo-objeto (8): ${pct(scores.cognitivo.byItem.item8, 4)}
- Anagramas/vocabulario (9): ${pct(scores.cognitivo.byItem.item9, 4)}
- Inferencia (10): ${pct(scores.cognitivo.byItem.item10, 3)}
- RESULTADO: ${scores.cognitivo.hasDifficulty ? "⚠️ DIFICULTADES en procesos de pensamiento (análisis, síntesis, abstracción, generalización)" : "✅ Sin dificultades cognitivas"}

### 3. PROCESOS LÉXICOS (Ítems 11-14) — ${pct(scores.lexical.totalCorrect, 17)}
- Produce rimas (11A): ${pct(scores.lexical.byItem.item11a, 4)}
- Identifica no-rima (11B): ${pct(scores.lexical.byItem.item11b, 4)}
- Sustitución de fonemas (12): ${pct(scores.lexical.byItem.item12, 3)}
- Omisión de fonemas (13): ${pct(scores.lexical.byItem.item13, 3)}
- Inversión de sílabas (14): ${pct(scores.lexical.byItem.item14, 3)}
- RESULTADO: ${scores.lexical.hasDifficulty ? "⚠️ DIFICULTADES léxicas" : "✅ Sin dificultades léxicas"}

### 4. ESCRITURA — DICTADO (Ejercicio 15)
- Errores de expresión escrita (mayor puntaje = más errores): ${scores.dictado.errorScore}/18
- Caligrafía: ${scores.dictado.caligrafia}/6
- Coherencia del texto: ${scores.dictado.coherencia}/10
- Producción textual: ${scores.dictado.produccion}/18
- RESULTADO: ${scores.dictado.hasDifficulty ? "⚠️ DIFICULTADES en escritura (dictado)" : "✅ Escritura adecuada"}

### 5. ESCRITURA — COMPOSICIÓN LIBRE (Ejercicio 16)
- Errores de expresión escrita: ${scores.composicion.errorScore}/18
- Caligrafía: ${scores.composicion.caligrafia}/6
- Coherencia del texto: ${scores.composicion.coherencia}/10
- Producción textual: ${scores.composicion.produccion}/18
- RESULTADO: ${scores.composicion.hasDifficulty ? "⚠️ DIFICULTADES en composición" : "✅ Composición adecuada"}

## ESTADO GENERAL DE APRENDIZAJE (Instrumento 2012)
Estado: ${scores.estadoGeneral.toUpperCase()}
Áreas con dificultad: ${scores.areasDificultad.length > 0 ? scores.areasDificultad.join(", ") : "Ninguna"}

---

Genera un análisis psicopedagógico integral que:
1. Evalúe los resultados del instrumento 2012 en relación a las expectativas curriculares del ${anioEscolar > 0 ? `${anioEscolar}° año de escolaridad` : "grado indicado"} (R.M. 1040/2022)
2. Considere si el desempeño es acorde, por debajo o superior a lo esperado para su edad y año escolar
3. Sea empático, práctico y orientado a la acción

Responde ÚNICAMENTE con un objeto JSON válido con exactamente esta estructura (sin texto adicional antes ni después):

{
  "diagnostico": {
    "resumen": "Párrafo de 3-4 oraciones describiendo el estado general del estudiante de forma clara y empática, mencionando explícitamente si su desempeño es acorde, inferior o superior a lo esperado para su grado según el currículo R.M. 1040/2022",
    "nivelDificultad": "sin-dificultades",
    "areasAfectadas": [],
    "relacionEdadGrado": "Descripción de si la edad es acorde al grado y qué implica pedagógicamente"
  },
  "fortalezas": [
    "Fortaleza 1 observada en los resultados en relación a las expectativas del grado",
    "Fortaleza 2"
  ],
  "areasDeMejora": [
    {
      "area": "Nombre del área",
      "descripcion": "Descripción específica del problema, comparando con lo esperado para el grado según R.M. 1040/2022",
      "brechaConCurriculo": "Descripción concreta de qué habilidades del currículo no están siendo logradas",
      "prioridad": "alta"
    }
  ],
  "recomendaciones": {
    "paraElDocente": [
      {
        "titulo": "Título de la estrategia pedagógica",
        "descripcion": "Descripción detallada y práctica de cómo implementarla en el aula, alineada al currículo EPCV",
        "frecuencia": "Ejemplo: 3 veces por semana, 15 minutos"
      }
    ],
    "paraLaFamilia": [
      {
        "titulo": "Actividad en casa",
        "descripcion": "Descripción simple y accesible para padres o tutores"
      }
    ],
    "derivacion": {
      "necesaria": false,
      "especialista": null,
      "justificacion": null
    }
  },
  "planSeguimiento": {
    "periodoRevaluacion": "Ejemplo: 3 meses",
    "indicadoresProgreso": [
      "Indicador medible y observable 1, alineado a las expectativas del grado",
      "Indicador medible y observable 2"
    ]
  }
}

Para nivelDificultad usa exactamente uno de: "sin-dificultades", "dificultad-leve", "dificultad-moderada", "dificultad-severa".
Para prioridad usa exactamente uno de: "alta", "media", "baja".
Para especialista usa uno de: "psicopedagogo", "fonoaudiólogo", "psicólogo", o null.`
}
