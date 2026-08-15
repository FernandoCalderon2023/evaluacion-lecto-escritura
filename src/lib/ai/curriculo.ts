/**
 * Currículo data-driven del Sistema Educativo Plurinacional (Bolivia).
 *
 * Fundamento normativo (trazabilidad para la tesis):
 *  - PRIMARIA (1º–6º): expectativas del currículo de Educación Primaria Comunitaria
 *    Vocacional (base del Instrumento MINEDU 2012 de lecto-escritura y R.M. 1040/2022).
 *  - SECUNDARIA (1º–6º): objetivos de Comunicación y Lenguajes de la Educación
 *    Secundaria Comunitaria Productiva — Planes y Programas ESCP 2023 (Ley 070).
 *
 * `anio` = año de escolaridad continuo: 1–6 = primaria, 7–12 = secundaria (1º–6º sec).
 */

export type NivelEducativo = "PRIMARIA" | "SECUNDARIA"

export interface ExpectativaCurricular {
  nivel: NivelEducativo
  gradoLabel: string
  edadEsperada: number
  comunicacionOral: string
  lectura: string
  escritura: string
  cognitivo: string
  lexico: string
  /** Referente normativo del que se derivan las expectativas (para la fundamentación). */
  fundamento: string
}

const PRIMARIA = "R.M. 1040/2022 · Currículo de Educación Primaria (Ley 070)"
const SECUNDARIA = "Planes y Programas ESCP 2023 · Comunicación y Lenguajes (Ley 070)"

export const CURRICULO: Record<number, ExpectativaCurricular> = {
  // ── PRIMARIA (contenido idéntico al instrumento vigente; no se altera) ──
  1: {
    nivel: "PRIMARIA", gradoLabel: "1º de primaria", edadEsperada: 6, fundamento: PRIMARIA,
    comunicacionOral: "Expresa experiencias y emociones usando normas de cortesía.",
    lectura: "Comprende textos literarios y no literarios relacionándolos con experiencias propias.",
    escritura: "Escribe textos usando código alfabético considerando destinatario y propósito.",
    cognitivo: "Nombra y describe objetos, sigue instrucciones simples, clasifica por categorías, orientación espacial básica, secuencias temporales.",
    lexico: "Identifica sonidos iniciales, produce rimas simples, reconoce patrones sonoros.",
  },
  2: {
    nivel: "PRIMARIA", gradoLabel: "2º de primaria", edadEsperada: 7, fundamento: PRIMARIA,
    comunicacionOral: "Interactúa expresando ideas, respetando turnos.",
    lectura: "Lee 60-84 palabras/min con precisión y expresividad. Comprende textos con oraciones simples.",
    escritura: "Escribe textos literarios y no literarios de manera organizada.",
    cognitivo: "Nombra y explica uso de objetos, instrucciones de dos pasos, clasifica imágenes, asociaciones verbo-objeto, secuencias temporales.",
    lexico: "Produce y reconoce rimas, sustituye fonemas simples, identifica omisiones.",
  },
  3: {
    nivel: "PRIMARIA", gradoLabel: "3º de primaria", edadEsperada: 8, fundamento: PRIMARIA,
    comunicacionOral: "Expresa ideas de manera coherente y articulada según propósito y contexto.",
    lectura: "Lee con fluidez. Interpreta textos determinando consecuencias, comparando personajes, reconociendo problema/solución.",
    escritura: "Escribe con secuencia lógica, estructura, conectores, descripciones y diálogo.",
    cognitivo: "Análisis y síntesis concretos, inferencias básicas, causa-consecuencia.",
    lexico: "Rimas con fluidez, sustitución y omisión de fonemas con precisión, inversiones silábicas.",
  },
  4: {
    nivel: "PRIMARIA", gradoLabel: "4º de primaria", edadEsperada: 9, fundamento: PRIMARIA,
    comunicacionOral: "Interactúa fundamentando ideas con respeto.",
    lectura: "Hace inferencias, identifica acciones principales, describe ambiente, relaciona intención del autor, compara textos.",
    escritura: "Secuencia lógica (inicio-desarrollo-desenlace), conectores, vocabulario pertinente.",
    cognitivo: "Abstracción y generalización, lenguaje figurado, razonamiento lógico, inferencias complejas.",
    lexico: "Conciencia fonológica avanzada: sustitución, omisión e inversión con precisión.",
  },
  5: {
    nivel: "PRIMARIA", gradoLabel: "5º de primaria", edadEsperada: 10, fundamento: PRIMARIA,
    comunicacionOral: "Fundamenta ideas desde escucha activa y empatía.",
    lectura: "Identifica idea central, interpreta lenguaje figurado, deduce características de personajes, compara textos.",
    escritura: "Estructura con idea central por párrafo, vocabulario pertinente.",
    cognitivo: "Pensamiento abstracto consolidado, razonamiento hipotético, análisis crítico.",
    lexico: "Conciencia fonológica y morfológica consolidada, vocabulario amplio.",
  },
  6: {
    nivel: "PRIMARIA", gradoLabel: "6º de primaria", edadEsperada: 11, fundamento: PRIMARIA,
    comunicacionOral: "Fundamenta ideas, regula participación, crea consensos.",
    lectura: "Inferencias complejas, idea central, lenguaje figurado, conclusiones sustentadas.",
    escritura: "Idea central por párrafo, vocabulario pertinente, investigación propia.",
    cognitivo: "Pensamiento crítico complejo, argumentación con evidencia, metacognición.",
    lexico: "Dominio fonológico completo, vocabulario activo y pasivo amplio.",
  },

  // ── SECUNDARIA (nuevo — Educación Secundaria Comunitaria Productiva) ──
  7: {
    nivel: "SECUNDARIA", gradoLabel: "1º de secundaria", edadEsperada: 12, fundamento: SECUNDARIA,
    comunicacionOral: "Teoría de la comunicación (código, lenguaje, actos de habla); expone y dialoga con normas.",
    lectura: "Comprende textos narrativos y descriptivos (el cuento boliviano); comprensión literal e inferencial; identifica hechos y secuencias.",
    escritura: "Produce textos narrativos y descriptivos con coherencia y cohesión; conectores de secuencia.",
    cognitivo: "Análisis, clasificación y comparación; relaciona causa-efecto en textos.",
    lexico: "Vocabulario contextual en aumento; ortografía y puntuación básicas; conciencia morfológica.",
  },
  8: {
    nivel: "SECUNDARIA", gradoLabel: "2º de secundaria", edadEsperada: 13, fundamento: SECUNDARIA,
    comunicacionOral: "Comunicación intra, inter y grupal; discurso con adecuación al contexto.",
    lectura: "Tipologías textuales; comprensión inferencial y reorganizativa de textos más extensos.",
    escritura: "Produce textos con adecuación, coherencia y cohesión; párrafos organizados.",
    cognitivo: "Inferencia, síntesis y jerarquización de ideas.",
    lexico: "Gramática aplicada a la producción; ampliación léxica; ortografía acentual.",
  },
  9: {
    nivel: "SECUNDARIA", gradoLabel: "3º de secundaria", edadEsperada: 14, fundamento: SECUNDARIA,
    comunicacionOral: "Oratoria y discurso; géneros discursivos.",
    lectura: "Géneros literarios y no literarios (la novela); texto expositivo; comprensión crítica inicial.",
    escritura: "Produce textos expositivos con cohesión y progresión temática.",
    cognitivo: "Abstracción, argumentación incipiente, construcción de modelos mentales del texto.",
    lexico: "Léxico académico básico; normativa ortográfica; conectores lógicos.",
  },
  10: {
    nivel: "SECUNDARIA", gradoLabel: "4º de secundaria", edadEsperada: 15, fundamento: SECUNDARIA,
    comunicacionOral: "Discurso argumentativo; debate.",
    lectura: "Texto argumentativo; lectura crítica (valoración de la postura del autor).",
    escritura: "Produce textos argumentativos con tesis, argumentos y conclusión.",
    cognitivo: "Razonamiento hipotético-deductivo; análisis crítico; metacognición lectora.",
    lexico: "Léxico especializado; precisión gramatical; normativa avanzada.",
  },
  11: {
    nivel: "SECUNDARIA", gradoLabel: "5º de secundaria", edadEsperada: 16, fundamento: SECUNDARIA,
    comunicacionOral: "Discurso académico y de investigación.",
    lectura: "Literatura boliviana y latinoamericana; el ensayo; lectura crítica autónoma.",
    escritura: "Produce ensayos y textos académicos con coherencia global.",
    cognitivo: "Pensamiento crítico complejo; síntesis de fuentes; argumentación con evidencia.",
    lexico: "Dominio léxico amplio; registro formal; normativa consolidada.",
  },
  12: {
    nivel: "SECUNDARIA", gradoLabel: "6º de secundaria", edadEsperada: 17, fundamento: SECUNDARIA,
    comunicacionOral: "Discurso argumentativo y académico autónomo.",
    lectura: "Literatura universal; tratado/ensayo; lectura crítica y análisis literario.",
    escritura: "Producción autónoma de textos complejos y de investigación.",
    cognitivo: "Metacognición, argumentación sustentada, pensamiento crítico consolidado.",
    lexico: "Dominio pleno del sistema; registro académico; investigación documental.",
  },
}

/** Devuelve las expectativas del grado formateadas para el prompt del informe IA. */
export function getExpectativasCurriculares(anio: number): string {
  if (anio === 0) return "Año de escolaridad no identificado."
  const e = CURRICULO[anio]
  if (!e) return "Año de escolaridad fuera del rango (1º primaria a 6º secundaria)."
  return `${e.gradoLabel.toUpperCase()} — nivel ${e.nivel} (edad esperada: ~${e.edadEsperada} años)
Comunicación oral: ${e.comunicacionOral}
Lectura: ${e.lectura}
Escritura: ${e.escritura}
Cognitivo esperado: ${e.cognitivo}
Léxico esperado: ${e.lexico}
[Referente: ${e.fundamento}]`
}
