"use client"
import { useState } from "react"
const pages = [
 "Portada", "Créditos y edición", "Cuadernillo del estudiante", "Presentación y ficha del estudiante",
 "Ejercicio 1: lectura", "Comprensión lectora y ejercicio 2", "Ejercicios 3 y 4", "Ejercicios 5 y 6",
 "Ejercicios 7 a 11: primera parte", "Ejercicios 11 a 15: continuación", "Ejercicio 16: composición",
 "Registro de lectura", "Registro de escritura",
]
const stepPage = [4, 5, 6, 7, 7, 8, 8, 9, 9, 9, 9, 9, 10, 10, 10, 10]
export function InstrumentViewer({ step = 0, expanded = false, fixedOpen = false, active = true }: { step?: number; expanded?: boolean; fixedOpen?: boolean; active?: boolean }) {
 const [open, setOpen] = useState(expanded)
 const [page, setPage] = useState(stepPage[step] ?? 1)
 const [zoom, setZoom] = useState(false)
 const [error, setError] = useState(false)
 function changePage(value: number) { setPage(value); setError(false); setZoom(false) }
 return <section className="evaluation-form min-w-0 rounded-xl border border-viria-200 bg-viria-50 p-3 sm:p-4" aria-label="Examen imprimible">
   <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-viria-900">Examen original e imprimible</h2><p className="mt-1 text-sm text-slate-600">Cuadernillo de lectoescritura · MINEDU Bolivia, 2012.</p></div>
   {!fixedOpen && <button type="button" aria-expanded={open} onClick={() => { if (!open) changePage(stepPage[step] ?? 1); setOpen(!open) }} className="min-h-11 rounded-lg border border-viria-300 bg-white px-3 py-2 text-sm font-semibold">{open ? "Ocultar examen" : "Ver examen aquí"}</button>}</div>
   <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-viria-800"><a href="/api/instrumento/original.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">Abrir PDF para imprimir ↗</a><a href="/api/instrumento/original.pdf?descargar=1" className="inline-flex min-h-11 items-center underline">Descargar PDF</a></div>
   {step >= 16 && <p className="mt-2 text-sm text-slate-600">Este documento contiene lectoescritura. No incluye la batería psicomotora de este apartado.</p>}
   {open && active && <div className="mt-4 min-w-0 space-y-3">
     <label className="block text-sm font-medium">Página del PDF<select value={page} onChange={e => changePage(Number(e.target.value))} className="mt-1 w-full min-w-0 rounded-lg border bg-white p-3 text-base">{pages.map((label, i) => <option key={i} value={i+1}>{i+1}. {label}</option>)}</select></label>
     <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={page===1} onClick={() => changePage(page-1)} className="min-h-11 rounded-lg border bg-white px-3 disabled:opacity-40">Anterior página</button><button type="button" disabled={page===13} onClick={() => changePage(page+1)} className="min-h-11 rounded-lg border bg-white px-3 disabled:opacity-40">Siguiente página</button><button type="button" aria-pressed={zoom} onClick={() => setZoom(!zoom)} className="min-h-11 rounded-lg border bg-white px-3">{zoom ? "Ajustar al ancho" : "Ampliar página"}</button></div>
     <p className="text-xs text-slate-600">Página {page} de 13. El original contiene páginas dobles. Amplía y desliza dentro de la imagen para leer los detalles. Para imprimir, abre el PDF y usa la opción de impresión del navegador.</p>
     {error ? <p role="alert" className="text-sm text-red-700">No se pudo cargar la vista. Abre el PDF desde el enlace superior.</p> : <div className="max-w-full overflow-auto rounded-lg border bg-white" tabIndex={0} role="region" aria-label="Vista del examen, desplazable al ampliar">
       {/* Original page raster: keep all figures and printed instructions intact. */}
       {/* eslint-disable-next-line @next/next/no-img-element */}
       <img key={page} src={`/api/instrumento/pagina-${String(page).padStart(2,"0")}.jpg`} alt={`Página ${page}: ${pages[page-1]}. Consulta el texto completo en el PDF original.`} width={1800} height={1200} onError={() => setError(true)} className={zoom ? "h-auto w-[1200px] max-w-none" : "h-auto w-full"}/>
     </div>}
     <p className="text-xs text-slate-600">Archivo original, sin respuestas añadidas ni cambios en las consignas. Las dos últimas páginas son registros para el evaluador. El documento original no incluye un formulario PDF rellenable.</p>
   </div>}
 </section>
}
