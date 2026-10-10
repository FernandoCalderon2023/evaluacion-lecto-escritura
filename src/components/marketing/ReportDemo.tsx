"use client"
import { useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Heart, Printer } from "lucide-react"

const views = [
  { id: "profesional", label: "Para el profesional", icon: BookOpen },
  { id: "familia", label: "Para la familia", icon: Heart },
] as const

export function ReportDemo() {
  const [view, setView] = useState<"profesional" | "familia">("profesional")
  const professional = view === "profesional"
  return <div className="mt-9">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
      <div role="group" aria-label="Vista del ejemplo" className="flex flex-wrap gap-2 rounded-xl bg-slate-200/60 p-1.5">{views.map(({id,label,icon: Icon}) => <button key={id} type="button" aria-pressed={view===id} onClick={()=>setView(id)} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${view===id ? "bg-white text-viria-800 shadow-sm" : "text-slate-600 hover:bg-white/60"}`}><Icon size={17}/>{label}</button>)}</div>
      <button type="button" onClick={()=>window.print()} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-viria-700"><Printer size={17}/>Imprimir ejemplo</button>
    </div>
    <article aria-live="polite" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
      <header className="border-b border-slate-200 px-6 py-7 sm:px-9"><div className="flex flex-wrap justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-widest text-viria-700">SIDEDA / Ejemplo ilustrativo</p><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Datos ficticios</span></div><h2 className="mt-4 text-2xl font-semibold tracking-tight">{professional ? "Orientación para el aula" : "Acompañar el aprendizaje en casa"}</h2><p className="mt-2 text-sm text-slate-500">Caso de ejemplo · 3º de primaria · Lectura y escritura</p></header>
      <div className="grid gap-9 p-6 sm:p-9 lg:grid-cols-[1fr_280px]">
        <div className="space-y-8">
          <section><h3 className="text-sm font-semibold text-viria-800">{professional ? "Fortalezas observadas en el ejemplo" : "Lo que ya hace bien"}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{professional ? "Identifica información explícita en un texto breve y participa en actividades de lectura acompañada. Se apoya en imágenes para explicar lo que ha comprendido." : "Puede encontrar información en una lectura breve y contar lo que entendió cuando conversan sobre las imágenes. Ese interés es un buen punto de partida para seguir aprendiendo."}</p></section>
          <section><h3 className="text-sm font-semibold text-slate-900">{professional ? "Área de apoyo prioritaria" : "Lo que podemos practicar"}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{professional ? "La organización de ideas antes de escribir. En este ejemplo se propone acompañar la planificación de un texto breve con una secuencia visible de inicio, desarrollo y cierre." : "Poner en orden las ideas antes de escribir. Pueden empezar contando juntos una experiencia: qué pasó primero, qué ocurrió después y cómo terminó."}</p></section>
          <section><h3 className="text-sm font-semibold text-slate-900">{professional ? "Propuesta de trabajo" : "Una actividad para hacer juntos"}</h3><ol className="mt-4 space-y-4">{(professional ? ["Presentar tres imágenes de una secuencia y conversar sobre su orden.", "Escribir una oración por imagen usando las tarjetas de inicio, desarrollo y cierre.", "Releer el texto junto al estudiante y elegir un aspecto para mejorar."] : ["Elijan una experiencia sencilla: una visita, un juego o una comida.", "Dibujen tres momentos y dejen que los cuente con sus propias palabras.", "Invítenle a escribir una frase y celebren el esfuerzo. Eviten corregir todo de una vez."]).map((s,i)=><li key={s} className="flex gap-4 text-sm leading-relaxed text-slate-600"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-viria-50 text-xs font-semibold text-viria-700">{i+1}</span>{s}</li>)}</ol></section>
          <section className="rounded-xl border border-viria-100 bg-viria-50/50 p-5"><h3 className="text-sm font-semibold text-viria-900">{professional ? "Qué observar después" : "Cómo compartir los avances"}</h3><p className="mt-2 text-sm leading-relaxed text-slate-600">{professional ? "Comparar una nueva producción escrita: ¿organiza la secuencia con menos ayuda?, ¿mantiene el tema?, ¿puede explicar qué quiso comunicar? Registrar qué apoyos utilizó." : "Guarden una muestra de lo que escribió y conversen con su docente sobre lo que resultó fácil o difícil. Los pequeños avances ayudan a elegir el próximo paso."}</p></section>
        </div>
        <aside className="space-y-5 print:!block"><div className="rounded-xl bg-[#f4f6f0] p-5"><h3 className="text-sm font-semibold text-slate-800">¿Qué incluye el sistema?</h3><ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600"><li>Registro de observaciones por ejercicio.</li><li>Puntajes calculados por el instrumento.</li><li>Interpretación y recomendaciones con IA.</li><li>Historial de evaluaciones del estudiante.</li></ul></div><div className="rounded-xl border border-slate-200 p-5"><p className="text-sm font-semibold text-slate-800">Revisión profesional</p><p className="mt-2 text-xs leading-relaxed text-slate-500">El profesional revisa los datos y la interpretación antes de entregar el informe. Esta muestra no sustituye una evaluación individual.</p></div></aside>
      </div>
      <footer className="border-t border-slate-100 px-6 py-4 text-xs leading-relaxed text-slate-500 sm:px-9">Ejemplo ficticio de presentación. No contiene datos personales ni puntajes de un estudiante real.</footer>
    </article>
    <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-viria-900 p-6 text-white print:hidden"><div><p className="font-semibold">¿Ya tienes acceso a SIDEDA?</p><p className="mt-1 text-sm text-viria-100">Ingresa con la cuenta que te asignó tu administrador.</p></div><Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-viria-900">Entrar a mi cuenta <ArrowRight size={17}/></Link></div>
  </div>
}
