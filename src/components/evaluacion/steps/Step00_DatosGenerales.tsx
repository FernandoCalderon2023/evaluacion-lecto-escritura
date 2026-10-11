"use client"
import { SectionHelp } from "../help/EvaluatorHelp"
import { EvaluacionFormData } from "@/types/evaluacion"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { GRADOS, anioFromGradoLabel } from "@/lib/grados"

interface Props {
  state: Partial<EvaluacionFormData>
  set: (field: keyof EvaluacionFormData) => (v: unknown) => void
  estudiantes: Array<{ id: string; codigo: string; grado: string }>
}

export function Step00DatosGenerales({ state, set, estudiantes }: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">Datos Generales de la Evaluación</h2>
      <SectionHelp step={0}/>

      <div className="space-y-1">
        <Label htmlFor="evaluation-student">Estudiante *</Label>
        <select id="evaluation-student"
          value={state.estudianteId ?? ""}
          onChange={(e) => {
            const id = e.target.value
            set("estudianteId")(id)
            // Autocompleta el año escolar desde el grado del/la estudiante (ajustable).
            const est = estudiantes.find((s) => s.id === id)
            const anio = anioFromGradoLabel(est?.grado)
            if (anio) set("anioEscolar")(anio)
          }}
          className="w-full border border-slate-300 bg-white text-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500"
          required
        >
          <option value="">— Seleccionar estudiante —</option>
          {estudiantes.map((est) => (
            <option key={est.id} value={est.id}>
              {est.codigo} — {est.grado}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="evaluation-date">Fecha de evaluación *</Label>
          <Input
            id="evaluation-date" type="date"
            value={state.fecha ?? ""}
            onChange={(e) => set("fecha")(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="evaluation-author">Evaluador/a *</Label>
          <Input
            id="evaluation-author" placeholder="Nombre del docente evaluador"
            value={state.evaluador ?? ""}
            onChange={(e) => set("evaluador")(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
        <p className="text-sm font-semibold text-slate-700">Datos para la evaluación integral</p>
        <p className="text-xs text-slate-500">
          Estos datos se usan para comparar el desempeño con las expectativas del currículo oficial
          boliviano —primaria (R.M. 1040/2022) o secundaria (ESCP)— según el año escolar del/la estudiante.
          Al elegir al/la estudiante, el año se autocompleta desde su grado (podés ajustarlo).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="evaluation-age">Edad del estudiante (años) *</Label>
            <Input
              id="evaluation-age" type="number"
              min={5}
              max={18}
              placeholder="Ej: 8"
              value={state.edadAlEvaluar ?? ""}
              onChange={(e) =>
                set("edadAlEvaluar")(e.target.value ? Number(e.target.value) : null)
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="evaluation-grade">Año de escolaridad *</Label>
            <select id="evaluation-grade"
              value={state.anioEscolar ?? ""}
              onChange={(e) =>
                set("anioEscolar")(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full border border-slate-300 bg-white text-slate-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500"
            >
              <option value="">— Seleccionar —</option>
              {GRADOS.map((g) => (
                <option key={g.anio} value={g.anio}>{g.anioLabel}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="evaluation-notes">Observaciones / Notas</Label>
        <textarea id="evaluation-notes"
          value={state.observaciones ?? ""}
          onChange={(e) => set("observaciones")(e.target.value || null)}
          placeholder="Ej: No se evaluó lectura porque el estudiante aún no lee. Sección X dejada en blanco porque..."
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500 min-h-[80px] resize-y"
          rows={3}
        />
        <p className="text-xs text-slate-400">Use este campo para anotar por qué se dejaron secciones en blanco u otras observaciones relevantes.</p>
      </div>

      <div className="bg-viria-50 border border-viria-200 rounded-lg p-4 text-sm text-viria-800">
        <p className="font-medium mb-1">Instrucciones</p>
        <p>
          Complete los datos de cada ejercicio según las respuestas del estudiante en el cuadernillo físico.
          Puede dejar campos en blanco si no aplican — use el campo de observaciones para explicar por qué.
          Use el botón &quot;Siguiente&quot; para avanzar entre ejercicios.
        </p>
      </div>
    </div>
  )
}
