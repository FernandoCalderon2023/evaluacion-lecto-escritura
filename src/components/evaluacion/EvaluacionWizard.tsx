"use client"
import { useReducer, useState } from "react"
import { useRouter } from "next/navigation"
import { EvaluacionFormData, EVALUACION_DEFAULTS } from "@/types/evaluacion"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"

// Steps
import { Step00DatosGenerales } from "./steps/Step00_DatosGenerales"
import { Step01Lectura } from "./steps/Step01_Lectura"
import { Step02Letras } from "./steps/Step02_Letras"
import { Step03Objetos } from "./steps/Step03_Objetos"
import { Step04Instrucciones } from "./steps/Step04_Instrucciones"
import { Step05Clasificacion } from "./steps/Step05_Clasificacion"
import { Step06Orientacion } from "./steps/Step06_Orientacion"
import { Step07Secuencia } from "./steps/Step07_Secuencia"
import { Step08Asociacion } from "./steps/Step08_Asociacion"
import { Step09Anagramas } from "./steps/Step09_Anagramas"
import { Step10Inferencia } from "./steps/Step10_Inferencia"
import { Step11Rimas } from "./steps/Step11_Rimas"
import { Step12Sustitucion } from "./steps/Step12_Sustitucion"
import { Step13Omision } from "./steps/Step13_Omision"
import { Step14Inversion } from "./steps/Step14_Inversion"
import { Step15Dictado } from "./steps/Step15_Dictado"
import { Step16Composicion } from "./steps/Step16_Composicion"
import { Step17BpmTonicidad } from "./steps/Step17_BPM_Tonicidad"
import { Step18BpmEquilibrio } from "./steps/Step18_BPM_Equilibrio"
import { Step19BpmLateralidadCuerpo } from "./steps/Step19_BPM_LateralidadCuerpo"
import { Step20BpmPraxiasET } from "./steps/Step20_BPM_PraxiasET"

const STEPS = [
  { label: "Datos Generales" },
  { label: "1. Lectura en Voz Alta" },
  { label: "2. Letras Incompletas" },
  { label: "3. Objetos" },
  { label: "4. Instrucciones" },
  { label: "5. Clasificación" },
  { label: "6. Orientación Espacial" },
  { label: "7. Secuencia" },
  { label: "8. Asociación" },
  { label: "9. Anagramas" },
  { label: "10. Inferencia" },
  { label: "11. Rimas" },
  { label: "12. Sustitución" },
  { label: "13. Omisión" },
  { label: "14. Inversión" },
  { label: "15. Dictado" },
  { label: "16. Composición" },
  { label: "BPM — Tonicidad" },
  { label: "BPM — Equilibrio" },
  { label: "BPM — Lateralidad y Cuerpo" },
  { label: "BPM — Praxias y E-T" },
]

type Action = { type: "SET"; field: keyof EvaluacionFormData; value: unknown }

function reducer(state: Partial<EvaluacionFormData>, action: Action): Partial<EvaluacionFormData> {
  return { ...state, [action.field]: action.value }
}

interface Props {
  estudianteId?: string
  estudiantes: Array<{ id: string; nombre: string; apellido1: string; grado: string }>
}

export function EvaluacionWizard({ estudianteId, estudiantes }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [state, dispatch] = useReducer(reducer, {
    ...EVALUACION_DEFAULTS,
    estudianteId: estudianteId ?? "",
    evaluador: "",
    fecha: new Date().toISOString().split("T")[0],
  })

  const set = (field: keyof EvaluacionFormData) => (value: unknown) =>
    dispatch({ type: "SET", field, value })

  async function handleSubmit() {
    setSaving(true)
    try {
      const res = await fetch("/api/evaluaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      })
      if (!res.ok) throw new Error()
      const ev = await res.json()
      toast({ title: "Evaluación guardada correctamente" })
      router.push(`/evaluaciones/${ev.id}`)
    } catch {
      toast({ title: "Error al guardar la evaluación", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const stepProps = { state, set }

  const stepComponents = [
    <Step00DatosGenerales key={0} {...stepProps} estudiantes={estudiantes} />,
    <Step01Lectura key={1} {...stepProps} />,
    <Step02Letras key={2} {...stepProps} />,
    <Step03Objetos key={3} {...stepProps} />,
    <Step04Instrucciones key={4} {...stepProps} />,
    <Step05Clasificacion key={5} {...stepProps} />,
    <Step06Orientacion key={6} {...stepProps} />,
    <Step07Secuencia key={7} {...stepProps} />,
    <Step08Asociacion key={8} {...stepProps} />,
    <Step09Anagramas key={9} {...stepProps} />,
    <Step10Inferencia key={10} {...stepProps} />,
    <Step11Rimas key={11} {...stepProps} />,
    <Step12Sustitucion key={12} {...stepProps} />,
    <Step13Omision key={13} {...stepProps} />,
    <Step14Inversion key={14} {...stepProps} />,
    <Step15Dictado key={15} {...stepProps} />,
    <Step16Composicion key={16} {...stepProps} />,
    <Step17BpmTonicidad key={17} {...stepProps} />,
    <Step18BpmEquilibrio key={18} {...stepProps} />,
    <Step19BpmLateralidadCuerpo key={19} {...stepProps} />,
    <Step20BpmPraxiasET key={20} {...stepProps} />,
  ]

  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Paso {step + 1} de {STEPS.length}</span>
          <span className="font-medium text-slate-700">{STEPS[step].label}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step pills - scrollable */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`shrink-0 px-2 py-1 rounded text-xs transition-colors ${
                i === step
                  ? "bg-blue-600 text-white"
                  : i < step
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">{stepComponents[step]}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar evaluación"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
