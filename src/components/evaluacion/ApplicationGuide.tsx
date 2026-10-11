"use client"

import { useEffect, useRef, useState } from "react"
import { ActivityTimer, elapsedSeconds, readingExpired, timerDisplay, stopActivity } from "@/lib/activityTimer"

type Attempt = ActivityTimer & { outcome?: "completed" | "interrupted" | "finished" }

export function ApplicationGuide({ step, onRunningChange }: { step: number; onRunningChange: (running: boolean) => void }) {
  const [attempts, setAttempts] = useState<Record<number, Attempt>>({})
  const [prepared, setPrepared] = useState<Record<number, boolean>>({})
  const [now, setNow] = useState(0)
  const [confirmRestart, setConfirmRestart] = useState(false)
  const lock = useRef(false)
  const attempt = attempts[step]
  const running = !!attempt && attempt.stoppedAt === undefined
  const elapsed = elapsedSeconds(attempt, now)
  const reading = step === 1

  useEffect(() => { onRunningChange(running) }, [running, onRunningChange])
  useEffect(() => { setConfirmRestart(false); lock.current = false }, [step])
  useEffect(() => {
    if (!running) return
    const update = () => {
      const timestamp = Date.now()
      setNow(timestamp)
      if (reading && readingExpired(attempt, timestamp)) {
        setAttempts(previous => ({ ...previous, [step]: { ...attempt, stoppedAt: attempt.startedAt + 240_000, outcome: "completed" } }))
        lock.current = false
      }
    }
    update()
    const interval = window.setInterval(update, 250)
    document.addEventListener("visibilitychange", update)
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", update) }
  }, [running, reading, attempt, step])
  useEffect(() => {
    if (!running) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [running])

  function start() {
    if (lock.current || !prepared[step]) return
    lock.current = true
    const timestamp = Date.now()
    setNow(timestamp)
    setAttempts(previous => ({ ...previous, [step]: { startedAt: timestamp } }))
    onRunningChange(true)
    setConfirmRestart(false)
  }
  function stop(finishedText = false) {
    if (!attempt) return
    const timestamp = Date.now()
    setNow(timestamp)
    setAttempts(previous => ({ ...previous, [step]: stopActivity(attempt, timestamp, reading, finishedText) }))
    lock.current = false
    onRunningChange(false)
  }

  if (step === 0) return <section className="rounded-xl border border-viria-200 bg-viria-50 p-4 space-y-3" aria-label="Preparación de la evaluación">
    <h2 className="font-semibold text-slate-900">Antes de empezar</h2>
    <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
      <li>Confirma el estudiante y quién realizará la aplicación. Prepara un lugar tranquilo, el cuadernillo y los materiales de las consignas.</li>
      <li>Abre cada actividad en «Ver preguntas». Explica la consigna sin resolverla por el estudiante.</li>
      <li>Marca que está preparado y pulsa «Iniciar actividad» cuando comience. En lectura se medirán hasta 4 minutos.</li>
      <li>Al terminar, registra lo observado y guarda la evaluación. Deja pendientes los apartados no aplicados; la escritura requiere revisión del psicopedagogo.</li>
    </ol>
    <p className="text-xs text-slate-600">Si transcribes una evaluación hecha en papel, puedes registrar sus resultados sin iniciar el cronómetro.</p>
  </section>

  return <section aria-label="Aplicación guiada" className="rounded-xl border border-viria-200 bg-viria-50 p-4 space-y-3">
    <h2 className="font-semibold text-slate-900">{running ? "2. Realiza la actividad" : attempt ? "3. Revisa y registra" : "1. Prepara la actividad"}</h2>
    {!attempt && <>
      <p className="text-sm text-slate-700">{reading ? "Abre el texto en «Ver preguntas». Inicia cuando el estudiante comience a leer en voz alta. Si termina el texto antes, pulsa «Terminó el texto». Al llegar a 4 minutos, identifica hasta dónde leyó; después registra las palabras y realiza las preguntas de comprensión." : step === 15 ? "Prepara el texto de dictado y las hojas de composición. El estudiante escribe; el psicopedagogo revisa las muestras. Este cronómetro es orientativo y no define la calificación." : step >= 16 ? "Consulta y aplica el protocolo profesional de BPM. Este cronómetro orientativo no sustituye los tiempos ni las consignas del protocolo." : "Revisa las consignas en «Ver preguntas» y prepara los materiales necesarios. Observa sin dar las respuestas. El cronómetro es orientativo: esta pantalla no establece un límite de tiempo."}</p>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={!!prepared[step]} onChange={event => setPrepared(previous => ({ ...previous, [step]: event.target.checked }))}/>He revisado la consigna y los materiales; el estudiante está preparado.</label>
    </>}
    <div className="flex flex-wrap items-center gap-4">
      <div><p className="text-xs text-slate-600">{reading ? "Tiempo disponible · máximo 4 minutos" : "Tiempo transcurrido · orientativo"}</p><p role="timer" aria-label={reading ? "Tiempo restante" : "Tiempo transcurrido"} className="font-mono text-3xl font-bold tabular-nums">{timerDisplay(reading ? 240 - elapsed : elapsed)}</p></div>
      {!attempt && <button type="button" disabled={!prepared[step]} onClick={start} className="min-h-12 rounded-lg bg-viria-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">Iniciar actividad</button>}
      {running && reading && <button type="button" onClick={() => stop(true)} className="min-h-12 rounded-lg bg-viria-600 px-4 py-3 text-sm font-semibold text-white">Terminó el texto</button>}
      {running && <button type="button" onClick={() => stop()} className="min-h-12 rounded-lg border border-slate-400 bg-white px-4 py-3 text-sm font-semibold">{reading ? "Detener lectura" : "Finalizar actividad"}</button>}
    </div>
    <p role="status" className="text-sm text-slate-700">{running ? "Cronómetro en marcha. Puedes cambiar entre preguntas y registro. Mantén esta pantalla visible para ver el aviso; no hay alarma sonora. Detén la actividad antes de cambiar de apartado o guardar." : attempt?.outcome === "finished" ? "Terminó el texto antes del máximo de 4 minutos. Registra las palabras leídas y la duración real en Observaciones, y continúa con la comprensión. No extrapoles el número de palabras a 4 minutos." : attempt?.outcome === "interrupted" ? "Lectura detenida antes de los 4 minutos. Anota la duración y el motivo en observaciones; no interpretes este tiempo parcial como una medición completa de 4 minutos." : attempt ? reading ? "Se completaron los 4 minutos. Registra las palabras leídas y continúa con la comprensión. El cronómetro no cuenta palabras ni asigna puntajes." : "Actividad finalizada. Registra lo observado; deja pendientes los criterios que no hayas valorado." : "El cronómetro comenzará únicamente al pulsar Iniciar actividad."}</p>
    {attempt && !running && <>
      <p className="text-xs text-slate-600">Duración medida: {timerDisplay(elapsed)}. Los tiempos son una ayuda en esta pantalla y no se guardan con el informe. Anótalos en observaciones si necesitas conservarlos. Se mantienen al cambiar de apartado, pero se pierden al recargar o salir.</p>
      {confirmRestart ? <div className="space-y-2"><p className="text-sm">¿Iniciar otra medición? Se reemplazará este tiempo; los resultados registrados no cambiarán. El profesional debe decidir si corresponde repetir la actividad.</p><div className="flex flex-wrap gap-2"><button type="button" className="min-h-12 rounded-lg border bg-white px-4" onClick={start}>Confirmar e iniciar</button><button type="button" className="min-h-12 rounded-lg border px-4" onClick={() => setConfirmRestart(false)}>Cancelar</button></div></div> : <button type="button" className="min-h-12 rounded-lg border bg-white px-4 text-sm" onClick={() => setConfirmRestart(true)}>Nueva medición</button>}
    </>}
    {!attempt && <p className="text-xs text-slate-600">¿Estás transcribiendo papel? Puedes completar el registro sin usar el cronómetro. Los tiempos no se conservan al salir o recargar.</p>}
  </section>
}
