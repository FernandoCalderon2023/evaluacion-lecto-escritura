"use client"
import { useEffect, useReducer, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { EvaluacionFormData, EVALUACION_DEFAULTS } from "@/types/evaluacion"
import { draftKey, readDraft, EvaluationDraft } from "@/lib/evaluationDraft"
import { useToast } from "@/hooks/use-toast"
import { ApplicationGuide } from "./ApplicationGuide"
import { InstrumentViewer } from "./InstrumentViewer"
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
import { Step15Escritura } from "./steps/Step15_Escritura"
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
  { label: "15-16. Escritura" },
  { label: "BPM — Tonicidad" },
  { label: "BPM — Equilibrio" },
  { label: "BPM — Lateralidad y Cuerpo" },
  { label: "BPM — Praxias y E-T" },
]

type Action = { type: "SET"; field: keyof EvaluacionFormData; value: unknown } | { type: "RESTORE"; data: Partial<EvaluacionFormData> }

function reducer(state: Partial<EvaluacionFormData>, action: Action): Partial<EvaluacionFormData> {
  if (action.type === "RESTORE") return action.data
  const next = { ...state, [action.field]: action.value }
  if (/^ej([3-9]|10)[a-z0-9]/.test(action.field) || action.field === "ej7" || action.field === "ej5b") next.cognitivoAplicado = false
  if (/^ej(11|12|13|14)/.test(action.field)) next.lexicoAplicado = false
  return next
}

interface Props {
  evaluatorName?: string
  draftOwner: string
  sourceRevision?: string
  estudianteId?: string
  estudiantes: Array<{ id: string; codigo: string; grado: string }>
  editMode?: string  // evaluacion ID if editing
  initialData?: Partial<EvaluacionFormData>
}

export function EvaluacionWizard({ evaluatorName, draftOwner, sourceRevision, estudianteId, estudiantes, editMode, initialData }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [activityRunning, setActivityRunning] = useState(false)
  const [view, setView] = useState<"registro" | "preguntas" | "ambas">("registro")
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1280px)")
    const adapt = () => { if (!wide.matches) setView(current => current === "ambas" ? "registro" : current) }
    wide.addEventListener("change", adapt)
    return () => wide.removeEventListener("change", adapt)
  }, [])
  const [state, dispatch] = useReducer(reducer, initialData ?? {
    ...EVALUACION_DEFAULTS,
    estudianteId: estudianteId ?? "",
    evaluador: evaluatorName ?? "",
    fecha: new Date().toISOString().split("T")[0],
  })

  const storageKey = draftKey(draftOwner, editMode, estudianteId, sourceRevision)
  const [pendingDraft, setPendingDraft] = useState<EvaluationDraft | null>(null)
  const [draftReady, setDraftReady] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [draftMessage, setDraftMessage] = useState("")
  const stepHeading = useRef<HTMLDivElement>(null)
  function goToStep(next: number) {
    if (activityRunning && next !== step) {
      toast({ title: "Detén la actividad antes de cambiar de apartado" }); return
    }
    setStep(next)
    requestAnimationFrame(() => {
      stepHeading.current?.focus({ preventScroll: true })
      stepHeading.current?.scrollIntoView({ block: "start", behavior: "instant" })
    })
  }
  const submitted = useRef(false)
  const studentIds = estudiantes.map(e => e.id).join(",")

  useEffect(() => {
    try {
      const draft = readDraft(sessionStorage.getItem(storageKey), studentIds.split(","))
      setPendingDraft(draft)
      if (!draft) sessionStorage.removeItem(storageKey)
    } catch { setDraftMessage("La recuperación automática no está disponible en este navegador. Guarda la evaluación antes de salir.") }
    setDraftReady(true)
  }, [storageKey, studentIds])

  useEffect(() => {
    if (!draftReady || pendingDraft || !dirty || submitted.current) return
    try {
      // Only form fields, never IDs of owners, computed scores or server metadata.
      const keys = new Set([...Object.keys(EVALUACION_DEFAULTS), "estudianteId", "evaluador", "fecha"])
      const data = Object.fromEntries(Object.entries(state).filter(([key]) => keys.has(key)))
      sessionStorage.setItem(storageKey, JSON.stringify({ version: 1, savedAt: Date.now(), step, data }))
      setDraftMessage("Avance recuperable en esta pestaña durante 24 horas. Para conservarlo al cerrar, guarda la evaluación.")
    } catch { setDraftMessage("No se pudo guardar el avance en esta pestaña. Guarda la evaluación antes de salir.") }
  }, [state, step, storageKey, draftReady, pendingDraft, dirty])

  const set = (field: keyof EvaluacionFormData) => (value: unknown) => {
    setDirty(true)
    dispatch({ type: "SET", field, value })
  }

  async function handleSubmit() {
    if (activityRunning) { toast({ title: "Detén la actividad antes de guardar" }); return }
    if (!state.estudianteId || !estudiantes.some(e => e.id === state.estudianteId)) {
      goToStep(0)
      toast({ title: "Selecciona un estudiante antes de guardar", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const url = editMode ? `/api/evaluaciones/${editMode}` : "/api/evaluaciones"
      const method = editMode ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        if (error.code === "SUBSCRIPTION_REQUIRED") { router.push("/suscripcion"); return }
        throw new Error(error.error || "No se pudo guardar la evaluación")
      }
      const ev = await res.json()
      submitted.current = true
      try { sessionStorage.removeItem(storageKey) } catch {}
      toast({ title: editMode ? "Evaluación actualizada" : "Evaluación guardada correctamente" })
      router.push(`/evaluaciones/${ev.id}`)
      router.refresh()
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Error al guardar la evaluación", variant: "destructive" })
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
    <Step15Escritura key={15} {...stepProps} />,
    <Step17BpmTonicidad key={17} {...stepProps} />,
    <Step18BpmEquilibrio key={18} {...stepProps} />,
    <Step19BpmLateralidadCuerpo key={19} {...stepProps} />,
    <Step20BpmPraxiasET key={20} {...stepProps} />,
  ]

  const isLast = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="evaluation-form min-w-0 space-y-5">
      {pendingDraft && (
        <div role="status" className="rounded-xl border border-viria-200 bg-viria-50 p-4 space-y-3">
          <p className="text-sm font-semibold">Tienes una evaluación en curso en esta pestaña.</p>
          <p className="text-xs text-slate-600">Último avance: {new Date(pendingDraft.savedAt).toLocaleString("es-BO")}. Puedes recuperarlo o descartarlo.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-lg bg-viria-600 px-3 py-2 text-sm text-white" onClick={() => {
              dispatch({ type: "RESTORE", data: pendingDraft.data }); setStep(pendingDraft.step); setDirty(true); setPendingDraft(null)
            }}>Recuperar avance</button>
            <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => {
              try { sessionStorage.removeItem(storageKey) } catch {}
              setPendingDraft(null)
            }}>Descartar avance</button>
          </div>
        </div>
      )}
      {draftMessage && <p role="status" className="text-xs text-slate-500">{draftMessage}</p>}
      <fieldset disabled={!!pendingDraft || !draftReady || saving} className="min-w-0 space-y-5 disabled:opacity-60">
      {/* Progress bar */}
      <div ref={stepHeading} tabIndex={-1} className="scroll-mt-20 lg:scroll-mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 mb-2">
          <span>Paso {step + 1} de {STEPS.length}</span>
          <span className="font-medium text-slate-700">{STEPS[step].label}</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-viria-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <label className="mt-3 block text-sm font-medium sm:hidden" htmlFor="evaluation-step">Ir a un apartado</label>
        <select id="evaluation-step" value={step} onChange={e => goToStep(Number(e.target.value))} className="mt-2 w-full min-w-0 rounded-lg border border-slate-300 bg-white p-3 text-base sm:hidden">
          {STEPS.map((s, i) => <option key={i} value={i}>{i + 1} / {STEPS.length} · {s.label}</option>)}
        </select>
        <div className="hidden sm:flex flex-wrap gap-1 mt-3 pb-1">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              aria-label={s.label}
              aria-current={i === step ? "step" : undefined}
              onClick={() => goToStep(i)}
              className={`shrink-0 min-h-10 min-w-10 px-2 py-1 rounded text-xs transition-colors ${
                i === step
                  ? "bg-viria-600 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <details className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
        <summary className="cursor-pointer py-1 font-semibold">¿Quién completa cada parte?</summary>
        <ul className="mt-3 space-y-2 pl-5 list-disc text-slate-600">
          <li><strong>Estudiante:</strong> responde las consignas y realiza su propio trabajo. El adulto no resuelve los ejercicios por él.</li>
          <li><strong>Mamá, papá o responsable:</strong> aporta lo que observa en casa desde el espacio familiar. Si acompaña la aplicación, sigue las indicaciones del profesional y comunica las ayudas o interrupciones.</li>
          <li><strong>Docente o profesional:</strong> completa este registro con lo observado durante la aplicación, señala los apartados no aplicados y revisa los resultados.</li>
          <li><strong>Psicopedagogo:</strong> revisa las muestras de escritura y su valoración. Si todavía no fueron revisadas, deja los criterios de escritura pendientes.</li>
        </ul>
      </details>
      <div className="space-y-2">
        <div role="group" aria-label="Vista de la evaluación" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={view === "preguntas"} onClick={() => setView("preguntas")} className={`min-h-12 flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${view === "preguntas" ? "border-viria-600 bg-viria-600 text-white" : "bg-white text-slate-700"}`}>Ver preguntas</button>
          <button type="button" aria-pressed={view === "registro"} onClick={() => setView("registro")} className={`min-h-12 flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${view === "registro" ? "border-viria-600 bg-viria-600 text-white" : "bg-white text-slate-700"}`}>Registrar evaluación</button>
          <button type="button" aria-pressed={view === "ambas"} onClick={() => setView("ambas")} className={`hidden min-h-12 flex-1 rounded-lg border px-3 py-2 text-sm font-semibold xl:block ${view === "ambas" ? "border-viria-600 bg-viria-600 text-white" : "bg-white text-slate-700"}`}>Ver ambas juntas</button>
        </div>
        <p className="text-xs text-slate-500">Puedes alternar sin perder las respuestas registradas. Guarda la evaluación para conservarlas al cerrar.</p>
      </div>
      <ApplicationGuide step={step} onRunningChange={setActivityRunning} />
      <div className={view === "ambas" ? "grid min-w-0 gap-5 xl:grid-cols-2" : "min-w-0"}>
        <div className={view === "registro" ? "hidden" : view === "ambas" ? "min-w-0 xl:max-h-[75vh] xl:overflow-y-auto" : "min-w-0"}>
          <InstrumentViewer key={step} step={step} expanded fixedOpen active={view !== "registro"} />
        </div>
        <section aria-label="Registro del evaluador" className={view === "preguntas" ? "hidden" : view === "ambas" ? "min-w-0 space-y-4 xl:max-h-[75vh] xl:overflow-y-auto xl:pr-3" : "min-w-0 space-y-4 sm:min-h-[400px]"}>
          {stepComponents[step]}
        </section>
      </div>

      <div className="grid grid-cols-2 gap-3 border-t pt-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <button type="button" onClick={() => goToStep(Math.max(0, step - 1))} disabled={step === 0} className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" />Anterior
        </button>
        {!isLast && <button type="button" onClick={() => goToStep(Math.min(STEPS.length - 1, step + 1))} className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-viria-600 px-4 py-3 text-sm font-medium text-white sm:order-3">
          Siguiente<ChevronRight className="h-4 w-4" />
        </button>}
        <button type="button" onClick={handleSubmit} disabled={saving} className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50 sm:order-2">
          <Save className="h-4 w-4" />{saving ? "Guardando..." : editMode ? "Actualizar evaluación" : "Guardar evaluación"}
        </button>
      </div>
      </fieldset>
    </div>
  )
}
