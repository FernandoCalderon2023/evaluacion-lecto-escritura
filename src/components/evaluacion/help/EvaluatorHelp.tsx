import { CRITERION_HELP, SECTION_HELP, type CriterionExplanation, type HelpKey } from "./content"

export function CriterionHelp({ helpKey, label }: { helpKey: HelpKey; label: string }) {
  const help: CriterionExplanation = CRITERION_HELP[helpKey]
  return <details className="rounded-lg border border-slate-200 bg-white p-3 text-sm print:hidden">
    <summary className="min-h-7 cursor-pointer font-medium text-viria-700" aria-label={`Qué significa: ${label}`}>¿Qué significa y cómo registrarlo?</summary>
    <div className="mt-2 space-y-2 leading-relaxed text-slate-700"><p>{help.meaning}</p>{help.example && <p><strong>Ejemplo orientativo: </strong>{help.example}</p>}{help.record && <p><strong>Al registrar: </strong>{help.record}</p>}</div>
  </details>
}

export function SectionHelp({ step }: { step: number }) {
  const help = SECTION_HELP[step]
  if (!help) return null
  return <details className="rounded-xl border border-viria-200 bg-viria-50 p-3 text-sm print:hidden"><summary className="min-h-8 cursor-pointer font-semibold text-viria-900">Cómo entender y registrar esta sección</summary><div className="mt-3 space-y-3 text-slate-700"><p><strong>Qué observar: </strong>{help.observe}</p><p><strong>Cómo proceder: </strong>{help.apply}</p><p><strong>Qué registrar: </strong>{help.record}</p>{step >= 16 && <p className="text-xs">Los nombres de la escala (apráxico, dispráxico, eupráxico e hiperpráxico) corresponden a niveles de la batería, del 1 al 4. Seleccionar un nivel no equivale a emitir un diagnóstico clínico.</p>}<p className="text-xs">Ayuda para el evaluador. No muestres las respuestas ni estos ejemplos durante la aplicación. Consulta el protocolo profesional para puntuar.</p></div></details>
}
