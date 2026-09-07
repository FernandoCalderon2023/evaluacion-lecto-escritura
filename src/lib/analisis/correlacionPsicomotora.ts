/**
 * MATRIZ DE CRUCE NEURO-PSICOMOTOR (BPM · Da Fonseca ↔ Instrumento MINEDU 2012)
 *
 * Implementa el ANEXO 3 — "Análisis de correlación: problemas de aprendizaje
 * basados en falta de desarrollo psicomotor" (Lourdes Olivares, SIDEDA).
 *
 * Objetivo: distinguir si una dificultad de lecto-escritura tiene ORIGEN
 * NEURO-PSICOMOTOR o es de naturaleza cognitivo-pedagógica, cruzando las
 * unidades funcionales de la BPM con los indicadores perceptivos, perceptivo-
 * motores y gráficos del instrumento del MINEDU.
 *
 * CRITERIO DIAGNÓSTICO CLAVE (textual del anexo):
 *   Si el/la estudiante comete errores frecuentes de rotaciones, inversiones,
 *   trazo irregular o escritura en espejo en la prueba del MINEDU, pero en la
 *   BPM obtiene calificaciones de 1 o 2 (perfil apráxico o dispráxico) en
 *   Lateralidad, Estructuración Espacio-Temporal o Praxia Fina, se confirma
 *   que la dificultad NO es estrictamente cognitivo-pedagógica, sino de base
 *   neuro-psicomotora.
 *
 * Este módulo NO diagnostica: describe correspondencias observadas para que
 * el/la profesional interprete.
 */
import type { AllScores } from "@/types/scoring"

export type EstadoArea = "alterada" | "adecuada" | "no-evaluada"

export type OrigenProbable =
  | "neuro-psicomotor"
  | "cognitivo-pedagogico"
  | "riesgo-psicomotor-sin-manifestacion"
  | "sin-indicios"
  | "no-determinable"

export interface IndicadorMinedu {
  /** Nombre legible del indicador del instrumento MINEDU. */
  nombre: string
  /** Dónde se registra (Lectura / Escritura / Ejercicio). */
  fuente: string
  /** Valor observado, ya legible ("A veces", "Malo", "1/3", "inicio"...). */
  valor: string
  /** ¿El indicador está presente (es decir, señala dificultad)? */
  presente: boolean
}

export interface FilaCorrelacion {
  /** Área psicomotora afectada (BPM). */
  area: string
  unidadFuncional: string
  bpm: {
    score: number | null
    perfil: string
    estado: EstadoArea
    detalle: string
  }
  /** Manifestaciones esperadas en lecto-escritura según el anexo. */
  manifestacionesEsperadas: string[]
  indicadores: IndicadorMinedu[]
  indicadoresPresentes: number
  /** true = BPM alterada Y al menos un indicador MINEDU presente. */
  correlacion: boolean
}

export interface CorrelacionPsicomotora {
  aplicable: boolean
  motivo?: string
  filas: FilaCorrelacion[]
  /** Áreas clave del criterio diagnóstico (Lateralidad, Estruct. E-T, Praxia Fina) alteradas. */
  areasClaveAlteradas: string[]
  /** Indicadores clave del criterio (rotaciones, inversiones, espejo, trazo irregular) presentes. */
  indicadoresClavePresentes: string[]
  correlacionesConfirmadas: number
  origenProbable: OrigenProbable
  /** Lectura del criterio diagnóstico en lenguaje profesional y prudente. */
  interpretacion: string
}

/* ─────────────────── helpers de lectura de valores ─────────────────── */

const ESCALA: Record<string, string> = { S: "Siempre", CS: "Casi siempre", AV: "A veces", N: "Nunca" }
const CALIDAD: Record<string, string> = { B: "Bueno", R: "Regular", M: "Malo" }
const POSICION: Record<string, string> = { I: "al inicio", M: "en el medio", F: "al final", N: "no presenta" }

/** Error por escala (S/CS/AV/N): presente si aparece alguna vez. */
function escalaPresente(v: unknown): boolean {
  return v === "S" || v === "CS" || v === "AV"
}
/** Error frecuente (S/CS) — usado para el criterio "errores frecuentes". */
function escalaFrecuente(v: unknown): boolean {
  return v === "S" || v === "CS"
}
/** Error por posición (I/M/F/N): presente si ocurre en alguna posición. */
function posicionPresente(v: unknown): boolean {
  return v === "I" || v === "M" || v === "F"
}
/** Calidad (B/R/M): deficiente si Regular o Malo. */
function calidadDeficiente(v: unknown): boolean {
  return v === "R" || v === "M"
}
function txtEscala(v: unknown): string { return ESCALA[String(v ?? "")] ?? "sin dato" }
function txtCalidad(v: unknown): string { return CALIDAD[String(v ?? "")] ?? "sin dato" }
function txtPosicion(v: unknown): string { return POSICION[String(v ?? "")] ?? "sin dato" }

/** Toma el peor valor entre dictado y composición para un mismo criterio. */
function peorCalidad(a: unknown, b: unknown): unknown {
  const orden: Record<string, number> = { M: 3, R: 2, B: 1 }
  const va = orden[String(a ?? "")] ?? 0
  const vb = orden[String(b ?? "")] ?? 0
  return va >= vb ? a : b
}
function peorEscala(a: unknown, b: unknown): unknown {
  const orden: Record<string, number> = { S: 4, CS: 3, AV: 2, N: 1 }
  const va = orden[String(a ?? "")] ?? 0
  const vb = orden[String(b ?? "")] ?? 0
  return va >= vb ? a : b
}

/** Estado de un área BPM a partir de su score promedio (1–4). */
function estadoArea(score: number | null | undefined): EstadoArea {
  if (!score || score <= 0) return "no-evaluada"
  return score <= 2 ? "alterada" : "adecuada"   // 1 apráxico / 2 dispráxico
}

/* ─────────────────── construcción de la matriz ─────────────────── */

export function calcularCorrelacionPsicomotora(
  ev: Record<string, unknown>,
  scores: AllScores,
): CorrelacionPsicomotora {
  const b = scores.bpm

  if (!b?.applied) {
    return {
      aplicable: false,
      motivo: "La matriz de correlación requiere la Batería Psicomotora (BPM) aplicada. Sin BPM no puede establecerse el origen psicomotor.",
      filas: [],
      areasClaveAlteradas: [],
      indicadoresClavePresentes: [],
      correlacionesConfirmadas: 0,
      origenProbable: "no-determinable",
      interpretacion: "No se aplicó la BPM: no es posible cruzar los hallazgos de lecto-escritura con el perfil psicomotor. Para determinar un posible origen neuro-psicomotor, aplique la BPM.",
    }
  }

  /* --- indicadores MINEDU reutilizados en varias filas --- */
  const rotacion = ev.errorRotacion
  const inversionLect = ev.errorInversion
  const vacilante = ev.lecturaVacilante
  const espejo = peorEscala(ev.dict_espejo, ev.comp_espejo)
  const invierteEsc = peorEscala(ev.dict_invierte, ev.comp_invierte)
  const confOrden = peorEscala(ev.dict_confOrden, ev.comp_confOrden)
  const caligCoord = peorCalidad(ev.dict_caligCoord, ev.comp_caligCoord)
  const caligUnif = peorCalidad(ev.dict_caligUnif, ev.comp_caligUnif)
  const present = peorCalidad(ev.dict_prodPresent, ev.comp_prodPresent)
  const ej6 = scores.cognitivo?.byItem?.item6 ?? null
  const ej6Falla = typeof ej6 === "number" && ej6 < 3   // Ej. 6 tiene 3 consignas

  const filas: FilaCorrelacion[] = []

  /* 1 · LATERALIDAD (2ª Unidad Funcional) */
  {
    const lat = b.lateralidad
    const estado: EstadoArea = !lat || lat.score <= 0
      ? "no-evaluada"
      : (lat.score <= 2 || !lat.definida) ? "alterada" : "adecuada"
    const indicadores: IndicadorMinedu[] = [
      { nombre: "Rotaciones (b/d, p/q, u/n)", fuente: "Lectura · errores", valor: txtPosicion(rotacion), presente: posicionPresente(rotacion) },
      { nombre: "Escribe en espejo / confunde derecha-izquierda", fuente: "Escritura · expresión escrita", valor: txtEscala(espejo), presente: escalaPresente(espejo) },
    ]
    filas.push({
      area: "Lateralidad (ocular, manual y dominancia adquirida)",
      unidadFuncional: "2ª Unidad Funcional — Análisis y procesamiento sensorial",
      bpm: {
        score: lat?.score ?? null,
        perfil: lat?.perfil ?? "—",
        estado,
        detalle: `Lateralidad ${lat?.tipo ?? "—"}${lat?.definida ? " (definida)" : " (NO definida)"} · puntaje ${lat?.score?.toFixed(1) ?? "—"}/4`,
      },
      manifestacionesEsperadas: [
        "Escritura y/o lectura en espejo",
        "Confusión de letras simétricas (rotaciones b/d, p/q)",
      ],
      indicadores,
      indicadoresPresentes: indicadores.filter((i) => i.presente).length,
      correlacion: estado === "alterada" && indicadores.some((i) => i.presente),
    })
  }

  /* 2 · ESTRUCTURACIÓN ESPACIO-TEMPORAL (2ª Unidad Funcional) */
  {
    const et = b.estructuracionET
    const estado = estadoArea(et?.score)
    const indicadores: IndicadorMinedu[] = [
      { nombre: "Inversiones (el/le, sol/los)", fuente: "Lectura · errores", valor: txtPosicion(inversionLect), presente: posicionPresente(inversionLect) },
      { nombre: "Invierte letras o palabras", fuente: "Escritura · expresión escrita", valor: txtEscala(invierteEsc), presente: escalaPresente(invierteEsc) },
      { nombre: "Confunde el orden de letras dentro de palabras", fuente: "Escritura · expresión escrita", valor: txtEscala(confOrden), presente: escalaPresente(confOrden) },
      { nombre: "Ejercicio 6 — orientación en el plano (izq./debajo/der.)", fuente: "Procesos cognitivos", valor: ej6 === null ? "sin dato" : `${ej6}/3`, presente: ej6Falla },
      { nombre: "Presentación: margen, sangría y espacio", fuente: "Escritura · producción de texto", valor: txtCalidad(present), presente: calidadDeficiente(present) },
    ]
    filas.push({
      area: "Estructuración espacio-temporal (organización, dinámica y rítmica)",
      unidadFuncional: "2ª Unidad Funcional — Análisis y procesamiento sensorial",
      bpm: {
        score: et?.score ?? null,
        perfil: et?.perfil ?? "—",
        estado,
        detalle: `Estructuración E-T ${et?.score?.toFixed(1) ?? "—"}/4 (${et?.perfil ?? "—"})`,
      },
      manifestacionesEsperadas: [
        "Inversión de sílabas y palabras (sol → los)",
        "Dificultad para mantener márgenes o la dirección del renglón",
        "Dificultad para seguir nociones espaciales en la hoja",
      ],
      indicadores,
      indicadoresPresentes: indicadores.filter((i) => i.presente).length,
      correlacion: estado === "alterada" && indicadores.some((i) => i.presente),
    })
  }

  /* 3 · PRAXIA FINA Y CONTROL TÓNICO (3ª Unidad Funcional) */
  {
    const pf = b.praxiaFina
    const pg = b.praxiaGlobal
    const estado = estadoArea(pf?.score)
    const indicadores: IndicadorMinedu[] = [
      { nombre: "Caligrafía — coordinación motora", fuente: "Escritura · caligrafía", valor: txtCalidad(caligCoord), presente: calidadDeficiente(caligCoord) },
      { nombre: "Caligrafía — uniformidad de los trazos", fuente: "Escritura · caligrafía", valor: txtCalidad(caligUnif), presente: calidadDeficiente(caligUnif) },
    ]
    filas.push({
      area: "Praxia fina y control tónico (coord. dinámica manual, velocidad-precisión)",
      unidadFuncional: "3ª Unidad Funcional — Programación y control del movimiento",
      bpm: {
        score: pf?.score ?? null,
        perfil: pf?.perfil ?? "—",
        estado,
        detalle: `Praxia fina ${pf?.score?.toFixed(1) ?? "—"}/4 (${pf?.perfil ?? "—"}) · praxia global ${pg?.score?.toFixed(1) ?? "—"}/4 (integración visomotora)`,
      },
      manifestacionesEsperadas: [
        "Trazo rígido, con presión excesiva, o tembloroso y débil",
        "Fatiga rápida al escribir",
        "Falta de alineación o tamaño irregular de las letras",
      ],
      indicadores,
      indicadoresPresentes: indicadores.filter((i) => i.presente).length,
      correlacion: estado === "alterada" && indicadores.some((i) => i.presente),
    })
  }

  /* 4 · NOCIÓN DEL CUERPO (2ª Unidad Funcional) */
  {
    const nc = b.nocionCuerpo
    const estado = estadoArea(nc?.score)
    const indicadores: IndicadorMinedu[] = [
      { nombre: "Ejercicio 6 — ubicación espacial en la hoja", fuente: "Procesos cognitivos", valor: ej6 === null ? "sin dato" : `${ej6}/3`, presente: ej6Falla },
      { nombre: "Escribe en espejo / confunde derecha-izquierda", fuente: "Escritura · expresión escrita", valor: txtEscala(espejo), presente: escalaPresente(espejo) },
    ]
    filas.push({
      area: "Noción del cuerpo (sentido kinestésico, reconocimiento izq./der.)",
      unidadFuncional: "2ª Unidad Funcional — Análisis y procesamiento sensorial",
      bpm: {
        score: nc?.score ?? null,
        perfil: nc?.perfil ?? "—",
        estado,
        detalle: `Noción del cuerpo ${nc?.score?.toFixed(1) ?? "—"}/4 (${nc?.perfil ?? "—"})`,
      },
      manifestacionesEsperadas: [
        "Desorientación en el espacio gráfico (no ubica el plano kinestésico-visual)",
      ],
      indicadores,
      indicadoresPresentes: indicadores.filter((i) => i.presente).length,
      correlacion: estado === "alterada" && indicadores.some((i) => i.presente),
    })
  }

  /* 5 · TONICIDAD Y SINCINESIAS (1ª Unidad Funcional) */
  {
    const to = b.tonicidad
    const estado = estadoArea(to?.score)
    const indicadores: IndicadorMinedu[] = [
      { nombre: "Lectura vacilante / fluidez", fuente: "Lectura · expresividad", valor: txtEscala(vacilante), presente: escalaPresente(vacilante) },
      { nombre: "Caligrafía — coordinación motora (calidad del trazo)", fuente: "Escritura · caligrafía", valor: txtCalidad(caligCoord), presente: calidadDeficiente(caligCoord) },
    ]
    filas.push({
      area: "Tonicidad y sincinesias (paratonía, movimientos parásitos)",
      unidadFuncional: "1ª Unidad Funcional — Tono y control de alerta",
      bpm: {
        score: to?.score ?? null,
        perfil: to?.perfil ?? "—",
        estado,
        detalle: `Tonicidad ${to?.score?.toFixed(1) ?? "—"}/4 (${to?.perfil ?? "—"})`,
      },
      manifestacionesEsperadas: [
        "Tensión muscular o movimientos parásitos al tomar el lápiz",
        "Fatiga que entorpece la agilidad lectora y escritora",
      ],
      indicadores,
      indicadoresPresentes: indicadores.filter((i) => i.presente).length,
      correlacion: estado === "alterada" && indicadores.some((i) => i.presente),
    })
  }

  /* ─── criterio diagnóstico clave del anexo ─── */
  const AREAS_CLAVE = [
    "Lateralidad (ocular, manual y dominancia adquirida)",
    "Estructuración espacio-temporal (organización, dinámica y rítmica)",
    "Praxia fina y control tónico (coord. dinámica manual, velocidad-precisión)",
  ]
  const areasClaveAlteradas = filas
    .filter((f) => AREAS_CLAVE.includes(f.area) && f.bpm.estado === "alterada")
    .map((f) => f.area)

  const indicadoresClavePresentes: string[] = []
  if (posicionPresente(rotacion)) indicadoresClavePresentes.push("Rotaciones en la lectura (b/d, p/q)")
  if (posicionPresente(inversionLect) || escalaFrecuente(invierteEsc)) indicadoresClavePresentes.push("Inversiones de letras/sílabas")
  if (escalaPresente(espejo)) indicadoresClavePresentes.push("Escritura en espejo / confusión izq.-der.")
  if (calidadDeficiente(caligCoord) || calidadDeficiente(caligUnif)) indicadoresClavePresentes.push("Trazo irregular (caligrafía)")

  const correlacionesConfirmadas = filas.filter((f) => f.correlacion).length
  const hayIndicadores = indicadoresClavePresentes.length > 0
  const hayAreas = areasClaveAlteradas.length > 0

  let origenProbable: OrigenProbable
  let interpretacion: string

  if (hayIndicadores && hayAreas) {
    origenProbable = "neuro-psicomotor"
    interpretacion =
      `Se cumple el criterio del análisis de correlación: se observan ${indicadoresClavePresentes.join(", ").toLowerCase()} en el instrumento MINEDU y, simultáneamente, un perfil apráxico o dispráxico en ${areasClaveAlteradas.length === 1 ? "el área" : "las áreas"} de ${areasClaveAlteradas.join(" y ").toLowerCase()}. ` +
      `Esto orienta a que la dificultad de lecto-escritura tiene una base neuro-psicomotora y no estrictamente cognitivo-pedagógica: el trabajo de apoyo debería incluir la dimensión corporal (lateralidad, organización espacio-temporal y praxia), además de lo pedagógico.`
  } else if (hayIndicadores && !hayAreas) {
    origenProbable = "cognitivo-pedagogico"
    interpretacion =
      `Se observan indicadores perceptivo-gráficos (${indicadoresClavePresentes.join(", ").toLowerCase()}), pero el perfil psicomotor en lateralidad, estructuración espacio-temporal y praxia fina se encuentra dentro de lo adecuado (puntajes 3 o 4). ` +
      `Esto orienta a un origen predominantemente cognitivo-pedagógico o instruccional, más que psicomotor: el apoyo puede centrarse en la enseñanza explícita de la lecto-escritura.`
  } else if (!hayIndicadores && hayAreas) {
    origenProbable = "riesgo-psicomotor-sin-manifestacion"
    interpretacion =
      `El perfil psicomotor muestra alteración en ${areasClaveAlteradas.join(" y ").toLowerCase()}, pero aún no se manifiestan en la lecto-escritura los indicadores asociados (rotaciones, inversiones, espejo o trazo irregular). ` +
      `Conviene un acompañamiento psicomotor preventivo y monitorear la aparición de estos indicadores.`
  } else {
    origenProbable = "sin-indicios"
    interpretacion =
      `No se observan indicadores perceptivo-gráficos de base psicomotora en el instrumento MINEDU ni alteración en las áreas psicomotoras clave. ` +
      `Si existen dificultades de lecto-escritura, conviene explorar otras causas (instruccionales, lingüísticas, atencionales o emocionales).`
  }

  return {
    aplicable: true,
    filas,
    areasClaveAlteradas,
    indicadoresClavePresentes,
    correlacionesConfirmadas,
    origenProbable,
    interpretacion,
  }
}

/** Render compacto para inyectar en el prompt de la IA. */
export function correlacionParaPrompt(c: CorrelacionPsicomotora): string {
  if (!c.aplicable) return ""
  const filas = c.filas
    .map((f) => {
      const ind = f.indicadores
        .map((i) => `${i.presente ? "[X]" : "[ ]"} ${i.nombre}: ${i.valor}`)
        .join(" | ")
      return `- ${f.area} → BPM ${f.bpm.score?.toFixed(1) ?? "—"}/4 (${f.bpm.perfil}, ${f.bpm.estado}). Indicadores MINEDU: ${ind}. ${f.correlacion ? "*** CORRELACIÓN CONFIRMADA ***" : ""}`
    })
    .join("\n")
  return `
## MATRIZ DE CORRELACIÓN NEURO-PSICOMOTORA (ANEXO 3 — BPM × MINEDU)

${filas}

- Áreas psicomotoras clave alteradas (perfil apráxico/dispráxico): ${c.areasClaveAlteradas.length ? c.areasClaveAlteradas.join("; ") : "ninguna"}
- Indicadores clave presentes en lecto-escritura: ${c.indicadoresClavePresentes.length ? c.indicadoresClavePresentes.join("; ") : "ninguno"}
- Correlaciones confirmadas: ${c.correlacionesConfirmadas} de ${c.filas.length}
- ORIGEN PROBABLE SEGÚN EL CRITERIO DEL ANEXO: ${c.origenProbable}
- Lectura del criterio: ${c.interpretacion}`
}
