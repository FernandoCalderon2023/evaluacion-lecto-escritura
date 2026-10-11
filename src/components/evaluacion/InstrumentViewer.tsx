"use client"
import { useState } from "react"
import { Activity } from "@/components/instrumento/Activities"
import { titles, TEMPLATE_VERSION } from "@/components/instrumento/content"

export function InstrumentViewer({ step = 0, expanded = false, fixedOpen = false, active = true }: { step?: number; expanded?: boolean; fixedOpen?: boolean; active?: boolean }) {
 const [open, setOpen] = useState(expanded)
 const [exercise, setExercise] = useState(step)
 return <section className="instrument-viewer min-w-0 rounded-xl border border-viria-200 bg-white p-4 sm:p-6" aria-label="Plantilla SIDEDA de lectoescritura">
  <header className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-widest text-viria-700">SIDEDA · Lectoescritura</p><h2 className="mt-2 text-lg font-semibold">Cuadernillo adaptado</h2><p className="mt-1 text-sm text-slate-600">Texto adaptable e ilustraciones vectoriales. Diseño {TEMPLATE_VERSION}.</p></div>{!fixedOpen && <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold">{open ? "Ocultar actividades" : "Ver actividades"}</button>}</header>
  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-viria-800"><a href="/evaluaciones/instrumento/imprimir?parte=estudiante" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-viria-200 px-3">Imprimir / guardar cuadernillo en PDF ↗</a><a href="/evaluaciones/instrumento/imprimir?parte=evaluador" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">Hojas del evaluador ↗</a></div>
  {open && active && <div className="mt-5 min-w-0">
   <p className="mb-4 text-sm text-slate-600">Estas hojas se responden en papel o de forma oral según la consigna. El adulto guarda la valoración en «Registrar evaluación»; aquí no se capturan respuestas.</p>
   {!fixedOpen && step < 16 && <label className="block text-sm font-medium">Actividad<select value={exercise} onChange={e => setExercise(Number(e.target.value))} className="mt-2 w-full min-w-0 rounded-lg border bg-white p-3 text-base">{titles.map((title,i)=><option key={i} value={i}>{title}</option>)}</select></label>}
   <article className="instrument-activity mt-5" aria-live="polite"><h3>{titles[exercise] ?? "Batería psicomotora"}</h3><Activity step={exercise}/></article>
   {!fixedOpen && step < 16 && <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={exercise===0} onClick={() => setExercise(n=>n-1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Anterior actividad</button><button type="button" disabled={exercise===15} onClick={() => setExercise(n=>n+1)} className="min-h-11 rounded-lg border px-4 disabled:opacity-40">Siguiente actividad</button></div>}
  </div>}
 </section>
}
