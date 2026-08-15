"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Informe en versión PARA PADRES/FAMILIA.
 * Reglas (basadas en buenas prácticas de reportes psicoeducativos a familias):
 *  - Lenguaje llano, sin jerga clínica ni puntajes.
 *  - Fortalezas PRIMERO.
 *  - Acciones concretas en casa.
 *  - SIN etiquetas diagnósticas.
 *  - Disclaimer reforzado ("orientación, no diagnóstico"), no evitable.
 */
export function InformePadres({
  analisis,
  sexo,
}: {
  analisis: any
  sexo?: string | null
}) {
  if (!analisis) {
    return (
      <p className="text-sm text-slate-500">
        Todavía no hay un informe generado para compartir con la familia.
      </p>
    )
  }

  const esFem = sexo === "Femenino" || sexo === "F"
  const suHija = esFem ? "su hija" : "su hijo"

  const resumen: string | undefined = analisis?.perfilDAE?.resumen
  const fortalezas: string[] = Array.isArray(analisis?.fortalezas) ? analisis.fortalezas : []
  const familia: { titulo?: string; descripcion?: string }[] = Array.isArray(analisis?.recomendaciones?.paraLaFamilia)
    ? analisis.recomendaciones.paraLaFamilia
    : []
  const derivacion = analisis?.recomendaciones?.derivacion

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Disclaimer reforzado — SIEMPRE arriba */}
      <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
        <p className="text-sm text-amber-900">
          <strong>Importante:</strong> este informe es una <strong>orientación</strong> para acompañar a {suHija} en casa,
          <strong> no es un diagnóstico</strong>. Solo un profesional (docente especialista o psicopedagogo/a) puede
          hacer un diagnóstico. Ante cualquier duda, conversalo con la maestra o un profesional.
        </p>
      </div>

      {/* Fortalezas primero */}
      {fortalezas.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base text-green-700">Lo que {suHija} hace bien 🌟</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
              {fortalezas.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Qué observamos (resumen empático, sin jerga) */}
      {resumen && (
        <Card>
          <CardHeader><CardTitle className="text-base">Qué observamos</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-slate-700 leading-relaxed">{resumen}</p></CardContent>
        </Card>
      )}

      {/* Acciones en casa — el corazón de esta versión */}
      {familia.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base text-viria-700">Qué pueden hacer en casa</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {familia.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-viria-50 border border-viria-100">
                  {r.titulo && <p className="text-sm font-semibold text-slate-800">{r.titulo}</p>}
                  {r.descripcion && <p className="text-sm text-slate-600 mt-0.5">{r.descripcion}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cuándo buscar apoyo (sin alarmar) */}
      {derivacion?.necesaria && (
        <Card>
          <CardHeader><CardTitle className="text-base">Cuándo buscar apoyo profesional</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700">
              {derivacion?.justificacion ??
                `Sería útil una valoración complementaria con ${derivacion?.especialista ?? "un/a especialista"} para acompañar mejor el aprendizaje. No es un problema grave: es sumar más apoyo.`}
            </p>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-slate-400 text-center pt-2">
        Compartí este informe con la maestra o un/a psicopedagogo/a para trabajar en equipo por {suHija}.
      </p>
    </div>
  )
}
