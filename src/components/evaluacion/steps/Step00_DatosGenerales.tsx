"use client"
import { EvaluacionFormData } from "@/types/evaluacion"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Props {
  state: Partial<EvaluacionFormData>
  set: (field: keyof EvaluacionFormData) => (v: unknown) => void
  estudiantes: Array<{ id: string; nombre: string; apellido1: string; grado: string }>
}

export function Step00DatosGenerales({ state, set, estudiantes }: Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">Datos Generales de la Evaluación</h2>

      <div className="space-y-1">
        <Label>Estudiante *</Label>
        <select
          value={state.estudianteId ?? ""}
          onChange={(e) => set("estudianteId")(e.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">— Seleccionar estudiante —</option>
          {estudiantes.map((est) => (
            <option key={est.id} value={est.id}>
              {est.apellido1} {est.nombre} — {est.grado}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Fecha de evaluación *</Label>
          <Input
            type="date"
            value={state.fecha ?? ""}
            onChange={(e) => set("fecha")(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label>Evaluador/a *</Label>
          <Input
            placeholder="Nombre del docente evaluador"
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
          boliviano (R.M. 1040/2022) según el año escolar del estudiante.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Edad del estudiante (años) *</Label>
            <Input
              type="number"
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
            <Label>Año de escolaridad *</Label>
            <select
              value={state.anioEscolar ?? ""}
              onChange={(e) =>
                set("anioEscolar")(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Seleccionar —</option>
              <option value={1}>1° año (1ro Primaria)</option>
              <option value={2}>2° año (2do Primaria)</option>
              <option value={3}>3° año (3ro Primaria)</option>
              <option value={4}>4° año (4to Primaria)</option>
              <option value={5}>5° año (5to Primaria)</option>
              <option value={6}>6° año (6to Primaria)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Observaciones / Notas</Label>
        <textarea
          value={state.observaciones ?? ""}
          onChange={(e) => set("observaciones")(e.target.value || null)}
          placeholder="Ej: No se evaluó lectura porque el estudiante aún no lee. Sección X dejada en blanco porque..."
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
          rows={3}
        />
        <p className="text-xs text-slate-400">Use este campo para anotar por qué se dejaron secciones en blanco u otras observaciones relevantes.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
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
