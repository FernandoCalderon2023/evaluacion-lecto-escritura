"use client"
import { EvaluacionFormData, ScaleValue, QualityValue } from "@/types/evaluacion"
import { scoreWriting } from "@/lib/scoring/writingScoring"
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
  const sv = (suffix: string) => (state[key(prefix, suffix)] ?? "") as ScaleValue
  const qv = (suffix: string) => (state[key(prefix, suffix)] ?? "") as QualityValue

  const registro = scoreWriting(state, prefix)

  return (
    <div className="space-y-6">
      <p role="status" className="text-sm text-slate-600">{registro.itemsRespondidos} de {registro.itemsEsperados} criterios registrados. Los campos vacíos quedan pendientes.</p>
      <p className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">En errores: S = siempre presenta el error; CS = casi siempre; AV = a veces; N = nunca en lo observado. En calidad: B = bien; R = regular; M = mejorar según la consigna y el criterio profesional. Un campo vacío queda pendiente; no equivale a Nunca ni a Mejorar. La ayuda no establece porcentajes o umbrales nuevos.</p>
      {/* Expresión escrita — errores */}
      <div className="border border-orange-200 rounded-lg p-4 space-y-3 bg-orange-50">
        <h3 className="font-medium text-orange-800 text-sm uppercase tracking-wide">
          Expresión escrita — Errores (S=Siempre tiene el error, N=Nunca)
        </h3>
        <ScaleSelector label="Invierte letras o palabras" helpKey="invierte" value={sv("invierte")} onChange={(v) => set(key(prefix, "invierte"))(v)} />
        <ScaleSelector label="Confunde el orden de letras dentro de palabras" helpKey="confOrden" value={sv("confOrden")} onChange={(v) => set(key(prefix, "confOrden"))(v)} />
        <ScaleSelector label="Omite letras o palabras" helpKey="omite" value={sv("omite")} onChange={(v) => set(key(prefix, "omite"))(v)} />
        <ScaleSelector label="Agrega letras o palabras" helpKey="agrega" value={sv("agrega")} onChange={(v) => set(key(prefix, "agrega"))(v)} />
        <ScaleSelector label="Dificultad para conectar vocales con consonantes" helpKey="dificConectar" value={sv("dificConectar")} onChange={(v) => set(key(prefix, "dificConectar"))(v)} />
        <ScaleSelector label="Confunde derecha/izquierda, escribe en espejo" helpKey="espejo" value={sv("espejo")} onChange={(v) => set(key(prefix, "espejo"))(v)} />
      </div>

      {/* Caligrafía */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Caligrafía</h3>
        <QualitySelector label="Uniformidad de los trazos" helpKey="caligUnif" value={qv("caligUnif")} onChange={(v) => set(key(prefix, "caligUnif"))(v)} />
        <QualitySelector label="Coordinación motora" helpKey="caligCoord" value={qv("caligCoord")} onChange={(v) => set(key(prefix, "caligCoord"))(v)} />
        <QualitySelector label="Limpieza" helpKey="caligLimp" value={qv("caligLimp")} onChange={(v) => set(key(prefix, "caligLimp"))(v)} />
      </div>

      {/* Coherencia del texto */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Coherencia del texto</h3>
        <QualitySelector label="Concordancia entre palabras (artículo/sustantivo/adjetivo)" helpKey="cohConcord" value={qv("cohConcord")} onChange={(v) => set(key(prefix, "cohConcord"))(v)} />
        <QualitySelector label="Secuencia correcta entre oraciones" helpKey="cohSecuencia" value={qv("cohSecuencia")} onChange={(v) => set(key(prefix, "cohSecuencia"))(v)} />
        <QualitySelector label="Elementos de enlace" helpKey="cohEnlace" value={qv("cohEnlace")} onChange={(v) => set(key(prefix, "cohEnlace"))(v)} />
        <QualitySelector label="Ajuste al tema" helpKey="cohTema" value={qv("cohTema")} onChange={(v) => set(key(prefix, "cohTema"))(v)} />
        <QualitySelector label="Estructura del texto" helpKey="cohEstructura" value={qv("cohEstructura")} onChange={(v) => set(key(prefix, "cohEstructura"))(v)} />
      </div>

      {/* Producción de texto */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Producción de texto</h3>
        <QualitySelector label="Presentación (margen, sangría, limpieza, letra)" helpKey="prodPresent" value={qv("prodPresent")} onChange={(v) => set(key(prefix, "prodPresent"))(v)} />
        <QualitySelector label="Extensión adecuada" helpKey="prodExtension" value={qv("prodExtension")} onChange={(v) => set(key(prefix, "prodExtension"))(v)} />
        <QualitySelector label="Orden correcto de ideas" helpKey="prodOrden" value={qv("prodOrden")} onChange={(v) => set(key(prefix, "prodOrden"))(v)} />
        <QualitySelector label="Ideas bien expresadas" helpKey="prodIdeas" value={qv("prodIdeas")} onChange={(v) => set(key(prefix, "prodIdeas"))(v)} />
        <QualitySelector label="El trabajo se adecua al título" helpKey="prodTitulo" value={qv("prodTitulo")} onChange={(v) => set(key(prefix, "prodTitulo"))(v)} />
        <QualitySelector label="Uso de comas necesarias" helpKey="prodComas" value={qv("prodComas")} onChange={(v) => set(key(prefix, "prodComas"))(v)} />
        <QualitySelector label="Signos de puntuación correctos" helpKey="prodPuntuacion" value={qv("prodPuntuacion")} onChange={(v) => set(key(prefix, "prodPuntuacion"))(v)} />
        <QualitySelector label="Signos de interrogación y admiración" helpKey="prodInterAdm" value={qv("prodInterAdm")} onChange={(v) => set(key(prefix, "prodInterAdm"))(v)} />
        <QualitySelector label="Uso correcto de mayúsculas" helpKey="prodMayusc" value={qv("prodMayusc")} onChange={(v) => set(key(prefix, "prodMayusc"))(v)} />
      </div>
    </div>
  )
}
