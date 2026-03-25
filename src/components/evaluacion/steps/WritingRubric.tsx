"use client"
import { EvaluacionFormData, ScaleValue, QualityValue } from "@/types/evaluacion"
import { ScaleSelector } from "@/components/shared/ScaleSelector"
import { QualitySelector } from "@/components/shared/QualitySelector"

type Prefix = "dict" | "comp"

interface Props {
  prefix: Prefix
  state: Partial<EvaluacionFormData>
  set: (f: keyof EvaluacionFormData) => (v: unknown) => void
}

function key(prefix: Prefix, suffix: string): keyof EvaluacionFormData {
  return `${prefix}_${suffix}` as keyof EvaluacionFormData
}

export function WritingRubric({ prefix, state, set }: Props) {
  const sv = (suffix: string) => (state[key(prefix, suffix)] ?? "N") as ScaleValue
  const qv = (suffix: string) => (state[key(prefix, suffix)] ?? "B") as QualityValue

  return (
    <div className="space-y-6">
      {/* Expresión escrita — errores */}
      <div className="border border-orange-200 rounded-lg p-4 space-y-3 bg-orange-50">
        <h3 className="font-medium text-orange-800 text-sm uppercase tracking-wide">
          Expresión escrita — Errores (S=Siempre tiene el error, N=Nunca)
        </h3>
        <ScaleSelector label="Invierte letras o palabras" value={sv("invierte")} onChange={(v) => set(key(prefix, "invierte"))(v)} />
        <ScaleSelector label="Confunde el orden de letras dentro de palabras" value={sv("confOrden")} onChange={(v) => set(key(prefix, "confOrden"))(v)} />
        <ScaleSelector label="Omite letras o palabras" value={sv("omite")} onChange={(v) => set(key(prefix, "omite"))(v)} />
        <ScaleSelector label="Agrega letras o palabras" value={sv("agrega")} onChange={(v) => set(key(prefix, "agrega"))(v)} />
        <ScaleSelector label="Dificultad para conectar vocales con consonantes" value={sv("dificConectar")} onChange={(v) => set(key(prefix, "dificConectar"))(v)} />
        <ScaleSelector label="Confunde derecha/izquierda, escribe en espejo" value={sv("espejo")} onChange={(v) => set(key(prefix, "espejo"))(v)} />
      </div>

      {/* Caligrafía */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Caligrafía</h3>
        <QualitySelector label="Uniformidad de los trazos" value={qv("caligUnif")} onChange={(v) => set(key(prefix, "caligUnif"))(v)} />
        <QualitySelector label="Coordinación motora" value={qv("caligCoord")} onChange={(v) => set(key(prefix, "caligCoord"))(v)} />
        <QualitySelector label="Limpieza" value={qv("caligLimp")} onChange={(v) => set(key(prefix, "caligLimp"))(v)} />
      </div>

      {/* Coherencia del texto */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Coherencia del texto</h3>
        <QualitySelector label="Concordancia entre palabras (artículo/sustantivo/adjetivo)" value={qv("cohConcord")} onChange={(v) => set(key(prefix, "cohConcord"))(v)} />
        <QualitySelector label="Secuencia correcta entre oraciones" value={qv("cohSecuencia")} onChange={(v) => set(key(prefix, "cohSecuencia"))(v)} />
        <QualitySelector label="Elementos de enlace" value={qv("cohEnlace")} onChange={(v) => set(key(prefix, "cohEnlace"))(v)} />
        <QualitySelector label="Ajuste al tema" value={qv("cohTema")} onChange={(v) => set(key(prefix, "cohTema"))(v)} />
        <QualitySelector label="Estructura del texto" value={qv("cohEstructura")} onChange={(v) => set(key(prefix, "cohEstructura"))(v)} />
      </div>

      {/* Producción de texto */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Producción de texto</h3>
        <QualitySelector label="Presentación (margen, sangría, limpieza, letra)" value={qv("prodPresent")} onChange={(v) => set(key(prefix, "prodPresent"))(v)} />
        <QualitySelector label="Extensión adecuada" value={qv("prodExtension")} onChange={(v) => set(key(prefix, "prodExtension"))(v)} />
        <QualitySelector label="Orden correcto de ideas" value={qv("prodOrden")} onChange={(v) => set(key(prefix, "prodOrden"))(v)} />
        <QualitySelector label="Ideas bien expresadas" value={qv("prodIdeas")} onChange={(v) => set(key(prefix, "prodIdeas"))(v)} />
        <QualitySelector label="El trabajo se adecua al título" value={qv("prodTitulo")} onChange={(v) => set(key(prefix, "prodTitulo"))(v)} />
        <QualitySelector label="Uso de comas necesarias" value={qv("prodComas")} onChange={(v) => set(key(prefix, "prodComas"))(v)} />
        <QualitySelector label="Signos de puntuación correctos" value={qv("prodPuntuacion")} onChange={(v) => set(key(prefix, "prodPuntuacion"))(v)} />
        <QualitySelector label="Signos de interrogación y admiración" value={qv("prodInterAdm")} onChange={(v) => set(key(prefix, "prodInterAdm"))(v)} />
        <QualitySelector label="Uso correcto de mayúsculas" value={qv("prodMayusc")} onChange={(v) => set(key(prefix, "prodMayusc"))(v)} />
      </div>
    </div>
  )
}
