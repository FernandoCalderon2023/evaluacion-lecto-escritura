import { EvaluacionFormData } from "@/types/evaluacion"
import { BpmResult, BpmUnitScore } from "@/types/scoring"

function perfilFromScore(score: number): "apráxico" | "dispráxico" | "eupráxico" | "hiperpráxico" {
  if (score <= 1.5) return "apráxico"
  if (score <= 2.5) return "dispráxico"
  if (score <= 3.5) return "eupráxico"
  return "hiperpráxico"
}

function avgNonNull(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v != null && v > 0)
  if (valid.length === 0) return 0
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function makeUnitScore(items: Record<string, number | null | undefined>): BpmUnitScore {
  const score = avgNonNull(Object.values(items))
  return {
    score: Math.round(score * 100) / 100,
    perfil: perfilFromScore(score),
    items: Object.fromEntries(
      Object.entries(items).map(([k, v]) => [k, v ?? null])
    ),
  }
}

export function scoreBpm(ev: Partial<EvaluacionFormData>): BpmResult {
  // Check if BPM was applied (at least one field has a value)
  const bpmFields = Object.keys(ev).filter(k => k.startsWith("bpm_"))
  const applied = bpmFields.some(k => {
    const val = ev[k as keyof EvaluacionFormData]
    return val != null && val !== ""
  })

  const tonicidad = makeUnitScore({
    inspiracion: ev.bpm_inspiracion,
    espiracion: ev.bpm_espiracion,
    apnea: ev.bpm_apnea,
    fatigabilidad: ev.bpm_fatigabilidad,
    extensibilidadMI: ev.bpm_extensibilidadMI,
    extensibilidadMS: ev.bpm_extensibilidadMS,
    pasividad: ev.bpm_pasividad,
    paratoniaMI: ev.bpm_paratoniaMI,
    paratoniaMS: ev.bpm_paratoniaMS,
    diadocMD: ev.bpm_diadocMD,
    diadocMI: ev.bpm_diadocMI,
    sincinBucales: ev.bpm_sincinBucales,
    sincinContralat: ev.bpm_sincinContralat,
  })

  const equilibrio = makeUnitScore({
    inamovilidad: ev.bpm_inamovilidad,
    apoyoRect: ev.bpm_eqApoyoRect,
    puntaPies: ev.bpm_eqPuntaPies,
    apoyoUnPie: ev.bpm_eqApoyoUnPie,
    marchaControl: ev.bpm_eqMarchaControl,
    bancoAdelante: ev.bpm_eqBancoAdelante,
    bancoAtras: ev.bpm_eqBancoAtras,
    bancoDerecho: ev.bpm_eqBancoDerecho,
    bancoIzquierdo: ev.bpm_eqBancoIzquierdo,
    pieCojoIzq: ev.bpm_eqPieCojoIzq,
    piecojoDer: ev.bpm_eqPieCojoDer,
    piesJuntosAdel: ev.bpm_eqPiesJuntosAdel,
    piesJuntosAtras: ev.bpm_eqPiesJuntosAtras,
    piesJuntosOjosCerr: ev.bpm_eqPiesJuntosOjosCerr,
  })

  // Laterality analysis
  const latFields = {
    ocular: ev.bpm_latOcular ?? null,
    auditiva: ev.bpm_latAuditiva ?? null,
    manual: ev.bpm_latManual ?? null,
    podal: ev.bpm_latPodal ?? null,
    innata: ev.bpm_latInnata ?? null,
    adquirida: ev.bpm_latAdquirida ?? null,
  }
  const latValues = Object.values(latFields).filter((v): v is string => v != null)
  const allD = latValues.every(v => v === "D")
  const allI = latValues.every(v => v === "I")
  const definida = latValues.length >= 4 && (allD || allI)
  let tipo = "no definida"
  let latScore = 1
  if (latValues.length === 0) {
    tipo = "no evaluada"
    latScore = 0
  } else if (allD) {
    tipo = "diestro"
    latScore = 4
  } else if (allI) {
    tipo = "zurdo"
    latScore = 4
  } else if (definida) {
    tipo = allD ? "diestro" : "zurdo"
    latScore = 4
  } else {
    // Check if mostly consistent
    const dCount = latValues.filter(v => v === "D").length
    const iCount = latValues.filter(v => v === "I").length
    if (dCount >= latValues.length * 0.75 || iCount >= latValues.length * 0.75) {
      tipo = "cruzada parcial"
      latScore = 3
    } else {
      tipo = "cruzada"
      latScore = 2
    }
  }

  const nocionCuerpo = makeUnitScore({
    sentidoKinest: ev.bpm_sentidoKinest,
    reconocimientoID: ev.bpm_reconocimientoID,
    autoimagenCara: ev.bpm_autoimagenCara,
    imitacionGestos: ev.bpm_imitacionGestos,
    dibujoCuerpo: ev.bpm_dibujoCuerpo,
  })

  const estructuracionET = makeUnitScore({
    organizacion: ev.bpm_etOrganizacion,
    estructDinamica: ev.bpm_etEstructDinamica,
    repTopografica: ev.bpm_etRepTopografica,
    estructRitmica: ev.bpm_etEstructRitmica,
  })

  const praxiaGlobal = makeUnitScore({
    coordOculoManual: ev.bpm_pgCoordOculoManual,
    coordOculoPodal: ev.bpm_pgCoordOculoPodal,
    dismetria: ev.bpm_pgDismetria,
    disociacion: ev.bpm_pgDisociacion,
    ms: ev.bpm_pgMS,
    mi: ev.bpm_pgMI,
    agilidades: ev.bpm_pgAgilidades,
  })

  const praxiaFina = makeUnitScore({
    coordDinamManual: ev.bpm_pfCoordDinamManual,
    tamborilear: ev.bpm_pfTamborilear,
    velocidadPrecision: ev.bpm_pfVelocidadPrecision,
  })

  // General profile average of 7 units
  const unitScores = [
    tonicidad.score, equilibrio.score, latScore,
    nocionCuerpo.score, estructuracionET.score,
    praxiaGlobal.score, praxiaFina.score,
  ].filter(s => s > 0)

  const promedioGeneral = unitScores.length > 0
    ? Math.round((unitScores.reduce((a, b) => a + b, 0) / unitScores.length) * 100) / 100
    : 0

  return {
    applied,
    tonicidad,
    equilibrio,
    lateralidad: {
      ...latFields,
      definida,
      tipo,
      score: latScore,
      perfil: perfilFromScore(latScore),
    },
    nocionCuerpo,
    estructuracionET,
    praxiaGlobal,
    praxiaFina,
    promedioGeneral,
    perfilGeneral: perfilFromScore(promedioGeneral),
  }
}
