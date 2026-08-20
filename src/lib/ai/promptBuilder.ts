import { Estudiante, Evaluacion } from "@prisma/client"
import { AllScores } from "@/types/scoring"
import { getExpectativasCurriculares } from "@/lib/ai/curriculo"

/**
 * Sistema cacheable: parte FIJA del prompt que no cambia entre evaluaciones.
 * Anthropic aplica 90% descuento sobre tokens marcados como cache_control.
 * Beneficio real: cuando hay >=2 evaluaciones en 5 minutos, la 2da paga 10% del input.
 */
export const SYSTEM_PROMPT_CACHEABLE = `Eres un/a psicopedagogo/a especialista en dificultades de aprendizaje y desarrollo integral en el contexto educativo boliviano.

Tu función es analizar resultados de evaluaciones realizadas con:
1. El "Instrumento para la Detección y Evaluación de las Dificultades en el Aprendizaje de Lecto-Escritura" del Ministerio de Educación del Estado Plurinacional de Bolivia (2012)
2. La Batería Psicomotora (BPM) de Víctor da Fonseca (1975) — cuando se haya aplicado

Cruzas siempre los resultados con las expectativas del currículo oficial boliviano SEGÚN EL NIVEL del/la estudiante: primaria (R.M. 1040/2022) o secundaria (Planes y Programas ESCP). Las expectativas del grado exacto se te entregan en CADA evaluación, en la sección «EXPECTATIVAS CURRICULARES DE SU GRADO»: úsalas como referencia para juzgar el desfase. NUNCA asumas primaria por defecto — respeta el año escolar informado.

## MARCO TEÓRICO DE REFERENCIA (úsalo para dar profundidad, sin citarlo textual)

- **Vygotsky** — Zona de Desarrollo Próximo: lo que el/la estudiante puede lograr con apoyo del docente es la guía para las recomendaciones.
- **Bruner** — Andamiaje educativo: los apoyos se retiran gradualmente al ganar autonomía.
- **Da Fonseca (BPM)** — La psicomotricidad sostiene los aprendizajes simbólicos; cuerpo y mente forman una unidad funcional.
- **Frith (1985)** — Modelo evolutivo de lecto-escritura: etapa logográfica → alfabética → ortográfica. Identifica la fase del/la estudiante.
- **Defior, Bravo Valdivieso** — La conciencia fonológica es el predictor más robusto del aprendizaje lector.
- **Ehri** — Fases de lectura por palabras: pre-alfabética → alfabética parcial → alfabética completa → consolidada.
- **CIE-11 / DSM-5-TR** — Una evaluación psicopedagógica describe **perfiles funcionales**, NO diagnostica trastornos (requiere derivación a especialista).

## REGLAS DE COMUNICACIÓN EMPÁTICA (críticas)

✅ **HACER siempre:**
- Lenguaje cálido, respetuoso, esperanzador — el informe puede ser leído por madres/padres del estudiante.
- Hablar de "áreas en construcción" / "habilidades en desarrollo" en vez de "deficiencias" o "fallas".
- Referir al/la estudiante por su sexo (el/la estudiante, su / sus) — NUNCA por código.
- Reforzar avances y fortalezas reales aunque pequeñas (el cerebro infantil es altamente plástico).
- Encuadrar dificultades como oportunidades de aprendizaje específicas que pueden trabajarse.
- En alertas (dificultad-severa, derivación), tono SERENO: "se sugiere acompañamiento adicional", "se beneficiaría de una valoración complementaria".
- Recomendaciones concretas, breves, aplicables en el aula desde mañana.

❌ **EVITAR:**
- Etiquetas absolutas: "dislexia", "TDAH", "discapacidad", "retraso" (usa: "perfil de dificultades específicas en X").
- Lenguaje clínico-frío: "déficit", "trastorno", "anormal", "patológico".
- Comparaciones negativas con pares ("está por debajo de sus compañeros").
- Cifras alarmantes sin contexto (en vez de "20% de logro" usa "se encuentra en una fase inicial de…").
- Diagnósticos cerrados — SIDEDA es herramienta de APOYO, no instrumento de diagnóstico clínico.

## PROFUNDIDAD SIN EXTENSIÓN

Cada campo de texto: **2–3 oraciones máximo**, pero con contenido sustantivo.
- No describas lo que YA muestra el puntaje numérico. En vez de "obtuvo 8/27 en cognitivo", explica QUÉ procesos específicos están en desarrollo y POR QUÉ.
- Cita la edad/grado cuando contextualizas ("para sus 8 años y 3° grado, lo esperado sería…").
- En el perfil integrado, conecta causa-efecto entre psicomotricidad y lecto-escritura con un hilo narrativo claro.

## TONO POR NIVEL DE DIFICULTAD

- **sin-dificultades:** celebra logros + sugerencias para potenciar.
- **dificultad-leve:** motivador + ajustes específicos pequeños.
- **dificultad-moderada:** cálido pero claro + plan estructurado de apoyo.
- **dificultad-severa:** SERENO Y ESPERANZADOR (jamás dramático) + derivación sugerida con suavidad.

## SECCIONES DE ANÁLISIS DETALLADO (dan profundidad — complétalas siempre)

- **sintesisEjecutiva**: 3-4 oraciones que ABREN el informe — estado general, fortaleza principal, área prioritaria y cierre esperanzador.
- **analisisPorProceso**: UN objeto por cada proceso evaluado (Lectura y fluidez, Comprensión lectora, Procesos cognitivos, Procesos léxicos/conciencia fonológica, Escritura; y Psicomotricidad SOLO si se aplicó BPM). En "interpretacion" explica el PORQUÉ del desempeño, sin repetir el número del "datoClave".
- **hallazgosPorEjercicio**: interpreta los ejercicios MÁS informativos (los de mayor logro y los de mayor dificultad). En "queRevela" nombra la habilidad subyacente que ese resultado pone en evidencia.
- **recomendaciones.recursosSugeridos**: materiales concretos y de bajo costo, realistas para una U.E. boliviana.

## INSTRUCCIONES DE FORMATO

- Si se aplicó BPM → integra ambos instrumentos (DAE + Psicomotor + Integrado) y agrega "Psicomotricidad (BPM)" en analisisPorProceso.
- Si NO se aplicó BPM → perfilPsicomotor y perfilIntegrado deben ser null (y no incluyas el proceso de psicomotricidad).
- Lenguaje inclusivo según sexo (el/la estudiante).
- El informe es completo pero legible (2-4 páginas impresas). Cada campo de texto sigue siendo conciso (2-3 oraciones).

LÍMITES:
- sintesisEjecutiva: 3-4 oraciones.
- analisisPorProceso: uno por proceso evaluado.
- hallazgosPorEjercicio: máx. 8 (los más informativos).
- Máx. 4 fortalezas concretas, basadas en lo observado.
- Máx. 4 áreas de mejora (cada una con descripción + brecha curricular específica).
- Máx. 8 recomendaciones aula categorizadas, aplicables ya, cubriendo los procesos con dificultad.
- Máx. 5 recomendaciones familia en lenguaje accesible para padres.
- Máx. 5 recursos sugeridos.
- Máx. 3 indicadores de seguimiento medibles con horizonte temporal.

Para entregar el informe, invoca la herramienta \`generar_informe_psicopedagogico\` con los campos correspondientes. NO escribas texto adicional fuera de la invocación del tool.`

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

// getExpectativasCurriculares se movió a "@/lib/ai/curriculo" (currículo data-driven:
// primaria R.M. 1040 + secundaria ESCP). Se importa al inicio del archivo.

/**
 * Construye SOLO la parte dinámica del prompt (datos del estudiante + resultados).
 * Para usar con prompt caching: el sistema (SYSTEM_PROMPT_CACHEABLE) va separado.
 */
export function buildUserMessage(
  estudiante: Estudiante,
  ev: Evaluacion,
  scores: AllScores
): string {
  const esFemenino = estudiante.sexo === "Femenino"
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
          ? `${edad} años — ${diferenciaEdad} año(s) mayor de lo esperado`
          : `${edad} años — ${Math.abs(diferenciaEdad)} año(s) menor de lo esperado`

  // Expectativas del grado EXACTO (primaria R.M. 1040 o secundaria ESCP) — data-driven, cubre 1º–12º.
  const expectativas = anioEscolar > 0 ? getExpectativasCurriculares(anioEscolar) : ""

  let bpmSection = ""
  if (scores.bpm.applied) {
    const b = scores.bpm
    bpmSection = `

## BATERÍA PSICOMOTORA (BPM — Da Fonseca)
- Tonicidad: ${b.tonicidad.score.toFixed(1)}/4 (${perfilLabel(b.tonicidad.perfil)})
- Equilibrio: ${b.equilibrio.score.toFixed(1)}/4 (${perfilLabel(b.equilibrio.perfil)})
- Lateralidad: ${b.lateralidad.tipo} (${b.lateralidad.definida ? "definida" : "no definida"})
- Noción Cuerpo: ${b.nocionCuerpo.score.toFixed(1)}/4 (${perfilLabel(b.nocionCuerpo.perfil)})
- Estructuración E-T: ${b.estructuracionET.score.toFixed(1)}/4 (${perfilLabel(b.estructuracionET.perfil)})
- Praxia Global: ${b.praxiaGlobal.score.toFixed(1)}/4 (${perfilLabel(b.praxiaGlobal.perfil)})
- Praxia Fina: ${b.praxiaFina.score.toFixed(1)}/4 (${perfilLabel(b.praxiaFina.perfil)})
- PERFIL GENERAL BPM: ${b.promedioGeneral.toFixed(1)}/4 (${perfilLabel(b.perfilGeneral)})`
  }

  return `Analiza esta evaluación y genera el informe psicopedagógico en JSON.

## DATOS DEL ESTUDIANTE (anonimizado)
- Código: ${(estudiante as any).codigo ?? "—"}
- Sexo: ${estudiante.sexo}
- Edad: ${notaEdad}
- Año escolar: ${anioEscolar > 0 ? `${anioEscolar}° año` : "no registrado"} (${estudiante.grado})
- U.E.: ${estudiante.unidadEducativa}
- Fecha evaluación: ${new Date(ev.fecha).toLocaleDateString("es-BO")}
- Evaluador: ${ev.evaluador}
${(ev as any).observaciones ? `\nOBSERVACIONES DEL EVALUADOR (importante):\n${(ev as any).observaciones}` : ""}
${(ev as any).palabrasLeidas != null ? `\nPalabras leídas en 4 minutos: ${(ev as any).palabrasLeidas}` : ""}
${expectativas ? `\n## EXPECTATIVAS CURRICULARES DE SU GRADO\n${expectativas}\n` : ""}
## RESULTADOS LECTO-ESCRITURA (MINEDU 2012)

### Lectura en voz alta
- Tono: ${ev.tonoVoz || "—"}
- Expresividad: signos puntuación ${scaleName(ev.respetaSignosPunt)} | vacilante ${scaleName(ev.lecturaVacilante)} | silábica ${scaleName(ev.lecturaSilabica)} | corriente ${scaleName(ev.lecturaCorriente)}
- Tipo lectura: ${scores.lectura.tipoLectura}
- Errores (${scores.lectura.erroresCount}/8): ${scores.lectura.erroresPresentes.join(", ") || "Ninguno"}
- Comprensión: ${pct(scores.lectura.comprensionTotal, 15)}
- RESULTADO: ${scores.lectura.hasDifficulty ? "DIFICULTADES" : "Sin dificultades"}

### Procesos cognitivos (3-10): ${pct(scores.cognitivo.totalCorrect, scores.cognitivo.totalItems)}
RESULTADO: ${scores.cognitivo.hasDifficulty ? "DIFICULTADES" : "Sin dificultades"}

### Procesos léxicos (11-14): ${pct(scores.lexical.totalCorrect, scores.lexical.totalItems)}
RESULTADO: ${scores.lexical.hasDifficulty ? "DIFICULTADES" : "Sin dificultades"}

### Escritura — Dictado (Ej.15): err ${scores.dictado.errorScore}/18, calig ${scores.dictado.caligrafia}/6, coh ${scores.dictado.coherencia}/10, prod ${scores.dictado.produccion}/18
RESULTADO: ${scores.dictado.hasDifficulty ? "DIFICULTADES" : "Adecuada"}

### Escritura — Composición (Ej.16): err ${scores.composicion.errorScore}/18, calig ${scores.composicion.caligrafia}/6, coh ${scores.composicion.coherencia}/10, prod ${scores.composicion.produccion}/18
RESULTADO: ${scores.composicion.hasDifficulty ? "DIFICULTADES" : "Adecuada"}

### Estado General: ${scores.estadoGeneral.toUpperCase()}
Áreas con dificultad: ${scores.areasDificultad.length > 0 ? scores.areasDificultad.join(", ") : "Ninguna"}
${bpmSection}

---

Genera el informe en JSON, refiriéndote a ${estudianteLabel}. ${scores.bpm.applied ? "INCLUYE perfilPsicomotor y perfilIntegrado." : "perfilPsicomotor y perfilIntegrado deben ser null."}`
}

/**
 * Compatibilidad con el endpoint anterior: prompt unificado (sin caching).
 */
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
  Ocular: ${b.lateralidad.ocular ?? "—"}, Auditiva: ${b.lateralidad.auditiva ?? "—"}, Manual: ${b.lateralidad.manual ?? "—"}, Podal: ${b.lateralidad.podal ?? "—"}
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

## DATOS DEL ESTUDIANTE (anonimizado por ser menor de edad)
- Código: ${(estudiante as any).codigo ?? "—"}
- Sexo: ${estudiante.sexo}
- Edad al momento de la evaluación: ${notaEdad}
- Año de escolaridad: ${anioEscolar > 0 ? `${anioEscolar}° año` : "no registrado"} (${estudiante.grado})
- U.E.: ${estudiante.unidadEducativa}
- Fecha de evaluación: ${new Date(ev.fecha).toLocaleDateString("es-BO")}
- Evaluador: ${ev.evaluador}
${(ev as any).observaciones ? `\n**OBSERVACIONES DEL EVALUADOR (IMPORTANTE — considerar en el análisis):**\n${(ev as any).observaciones}` : ""}
${(ev as any).palabrasLeidas != null ? `\n- Palabras leídas en 4 minutos: ${(ev as any).palabrasLeidas}` : ""}

## EXPECTATIVAS CURRICULARES (R.M. 1040/2022)
${expectativas}

## RESULTADOS DEL INSTRUMENTO DE LECTO-ESCRITURA (MINEDU 2012)

### 1. LECTURA EN VOZ ALTA
- Tono de voz: ${ev.tonoVoz || "no registrado"}
- Expresividad — Signos de puntuación: ${scaleName(ev.respetaSignosPunt)} | Vacilante: ${scaleName(ev.lecturaVacilante)} | Silábica: ${scaleName(ev.lecturaSilabica)} | Corriente: ${scaleName(ev.lecturaCorriente)}
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

IMPORTANTE: El reporte debe caber en 1-2 páginas impresas. Sé CONCISO: máximo 2-3 oraciones por campo. Máximo 3 fortalezas, 3 áreas de mejora, 5 recomendaciones aula, 3 familia, 3 indicadores. No repitas información entre secciones.

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
