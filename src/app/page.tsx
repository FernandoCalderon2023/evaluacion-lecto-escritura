import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpen, Building2, Check, FileText, HeartHandshake, Layers3, Users } from "lucide-react"
import { ProductHeader, ProductFooter } from "@/components/marketing/ProductShell"

const benefits = [
  { icon: BookOpen, title: "Evalúa con orden", text: "Registra las observaciones en un recorrido guiado y consulta qué evalúa cada ejercicio." },
  { icon: FileText, title: "Convierte datos en orientación", text: "Revisa los resultados y genera un informe con fortalezas, áreas de apoyo y recomendaciones." },
  { icon: HeartHandshake, title: "Acerca a la familia", text: "Comparte una versión del informe con sugerencias para acompañar el aprendizaje en casa." },
]
const audiences = [
  { icon: Users, title: "Docentes", subtitle: "Una mirada más clara de cada estudiante.", items: ["Registro guiado de la evaluación", "Resultados y recomendaciones para el aula", "Historial de evaluaciones por estudiante"] },
  { icon: Layers3, title: "Profesionales", subtitle: "La información reunida para tu valoración.", items: ["Lectoescritura y registro psicomotor opcional", "Informe integrado para revisar e imprimir", "Portafolio y comparación de puntajes"] },
  { icon: Building2, title: "Unidades educativas", subtitle: "Organiza el trabajo de tu equipo.", items: ["Cuentas para docentes y roles por organización", "Panel de estudiantes según su última evaluación", "Información agregada según el alcance del usuario"] },
]

export default function LandingPage() {
  return <div className="min-h-screen bg-[#fafaf7] text-slate-900">
    <ProductHeader />
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.12fr_1fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div>
          <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-viria-700"><span className="h-2 w-2 rounded-full bg-viria-600" /> Para quienes acompañan el aprendizaje</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[64px]">Comprende mejor.<br /><span className="text-viria-700">Acompaña mejor.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600">De las observaciones del aula a un informe claro. SIDEDA reúne evaluación, orientación con IA y seguimiento del estudiante en un mismo lugar.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/demo" className="inline-flex items-center gap-3 rounded-full bg-viria-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-viria-800">Explorar un ejemplo <ArrowRight size={18} /></Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3.5 text-sm font-semibold transition hover:bg-white">Ya tengo una cuenta <ArrowUpRight size={17} /></Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">El ejemplo es público y ficticio. No necesitas registrarte.</p>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200 pt-6 text-xs text-slate-600">
            <span className="flex items-center gap-2"><Check size={15} className="text-viria-700" /> Contexto educativo boliviano</span>
            <span className="flex items-center gap-2"><Check size={15} className="text-viria-700" /> Informes para aula y familia</span>
          </div>
        </div>
        <div className="relative rounded-[28px] bg-[#e7eeeb] p-5 sm:p-8">
          <div className="mb-5 flex items-center justify-between text-xs text-viria-900"><span className="font-semibold">Una evaluación. Una ruta de apoyo.</span><span className="rounded-full border border-viria-900/15 px-2.5 py-1">Vista ilustrativa</span></div>
          <div className="rounded-2xl border border-white bg-white p-6 shadow-[0_20px_60px_-30px_rgba(1,50,58,0.3)] sm:p-7">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-5"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Informe de aprendizaje</p><h2 className="mt-2 text-lg font-semibold">Cada avance cuenta.</h2></div><FileText size={24} className="text-viria-600" /></div>
            <div className="space-y-5 pt-5">
              <div><p className="text-xs font-semibold text-viria-700">01 / Lo que ya puede hacer</p><p className="mt-2 text-sm leading-relaxed text-slate-600">Reconoce información explícita y participa cuando la lectura se acompaña con preguntas.</p></div>
              <div><p className="text-xs font-semibold text-slate-700">02 / El siguiente paso</p><p className="mt-2 text-sm leading-relaxed text-slate-600">Practicar cómo ordenar las ideas antes de escribir un texto breve.</p></div>
              <div className="rounded-xl bg-[#f4f6f0] p-4"><p className="text-xs font-semibold text-slate-800">03 / Una acción para el aula</p><p className="mt-2 text-sm leading-relaxed text-slate-600">Usar tres tarjetas: inicio, desarrollo y cierre. Revisar juntos el texto al terminar.</p></div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-600"><span>Observa → interpreta → acompaña</span><Link href="/demo" className="font-semibold text-viria-800 underline underline-offset-4">Ver el ejemplo completo</Link></div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-5 py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">{benefits.map(({icon: Icon,title,text}) => <article key={title}><Icon size={24} strokeWidth={1.5} className="mb-4 text-viria-700" /><h2 className="text-lg font-semibold tracking-tight">{title}</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">{text}</p></article>)}</div>
      </section>

      <section id="soluciones" className="mx-auto max-w-7xl scroll-mt-8 px-5 py-20 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-viria-700">Distintos equipos. Un propósito compartido.</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Una herramienta que acompaña<br className="hidden sm:block" /> tu forma de trabajar.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">{audiences.map(({icon: Icon,title,subtitle,items}) => <article key={title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7"><Icon size={25} strokeWidth={1.5} className="text-viria-700" /><h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-500">{subtitle}</p><ul className="mt-6 space-y-4">{items.map(item => <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-700"><Check size={17} className="mt-1 shrink-0 text-viria-700" />{item}</li>)}</ul></article>)}</div>
        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-500">Las familias reciben orientación a través del informe compartido por su docente o profesional. El acceso al sistema se habilita con una cuenta asignada.</p>
      </section>

      <section id="como-funciona" className="bg-viria-900 px-5 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.2em] text-viria-200">Un recorrido claro</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">Del registro a la próxima acción.</h2></div><Link href="/demo" className="inline-flex items-center gap-2 text-sm font-medium text-viria-100">Explorar el resultado <ArrowUpRight size={18} /></Link></div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{[
            ["01", "Organiza", "Registra al estudiante, su grado y el contexto de la evaluación."],
            ["02", "Evalúa", "Completa los criterios observados. Guarda y retoma los apartados pendientes."],
            ["03", "Revisa", "Consulta los puntajes y revisa la interpretación de IA antes de compartirla."],
            ["04", "Acompaña", "Lleva las recomendaciones al aula y consulta el historial en la próxima evaluación."],
          ].map(([n,title,text]) => <div key={n} className="border-t border-white/20 pt-5"><span className="text-xs tabular-nums text-viria-200">{n}</span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-viria-100/80">{text}</p></div>)}</div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2 lg:px-8">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-viria-700">Conoce el alcance</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">La tecnología apoya.<br />Tu criterio orienta.</h2><p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-600">SIDEDA utiliza registros de lectoescritura basados en MINEDU 2012, una selección de ítems de la BPM y referencias curriculares por grado. La pertinencia de cada instrumento debe ser revisada por quien realiza la evaluación.</p><Link href="/acerca" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-viria-800 underline underline-offset-4">Conocer la metodología <ArrowUpRight size={16} /></Link></div>
        <div className="space-y-2">{[
          ["¿Puedo conocerlo antes de tener una cuenta?", "Sí. El ejemplo público muestra cómo se organiza la información para el profesional y para la familia, sin usar datos reales."],
          ["¿La IA determina un diagnóstico?", "El informe es una orientación que requiere revisión profesional. Los puntajes del instrumento y la interpretación de IA se presentan por separado."],
          ["¿Qué pasa si una evaluación queda pendiente?", "Puedes guardar el registro y continuarlo después. Las rúbricas incompletas de lectura y escritura se muestran como pendientes, sin emitir una clasificación general definitiva."],
          ["¿Puedo entregar el informe a una familia?", "La evaluación tiene una vista para familias y opciones de impresión. El profesional revisa el contenido antes de compartirlo."],
        ].map(([q,a]) => <details key={q} className="group rounded-xl border border-slate-200 bg-white px-5 py-4"><summary className="cursor-pointer text-sm font-semibold text-slate-800">{q}</summary><p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p></details>)}</div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8"><div className="flex flex-col items-start justify-between gap-7 rounded-2xl border border-slate-200 bg-white p-8 sm:flex-row sm:items-center lg:p-10"><div><h2 className="text-2xl font-semibold tracking-tight">Mira lo que puedes entregar.</h2><p className="mt-2 text-sm text-slate-500">Explora una muestra y conoce el recorrido de SIDEDA.</p></div><Link href="/demo" className="inline-flex shrink-0 items-center gap-3 rounded-full bg-viria-900 px-6 py-3 text-sm font-semibold text-white hover:bg-viria-800">Ver ejemplo de informe <ArrowRight size={18} /></Link></div></section>
    </main>
    <ProductFooter />
  </div>
}
