import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, BookOpen, Building2, Check, FileText, HeartHandshake, Layers3, Users } from "lucide-react"
import { ProductHeader, ProductFooter } from "@/components/marketing/ProductShell"

export const metadata: Metadata = {
  title: "SIDEDA | Aprendizaje en el aula y en casa",
  description: "Una plataforma para familias, docentes, profesionales y unidades educativas. Registra observaciones, revisa resultados y acompaña la lectura y escritura. Prueba gratuita sin tarjeta.",
  alternates: { canonical: "https://sideda.com" },
  openGraph: {
    title: "SIDEDA | Aprendizaje en el aula y en casa",
    description: "Familias y docentes: dos recorridos para acompañar el aprendizaje. Conoce SIDEDA y comienza tu prueba gratuita.",
    url: "https://sideda.com",
  },
}

const audiences = [
  { icon: HeartHandshake, title: "Para familias", subtitle: "Acompaña desde lo que observas en casa.", items: ["Cuenta propia para mamá, papá o responsable", "Seis preguntas para niños de 6 a 12 años", "Resumen editable e imprimible para conversar con su docente"], href: "/familias", action: "Conocer el espacio familiar", family: true },
  { icon: Users, title: "Para docentes", subtitle: "Conoce el desempeño y organiza el siguiente paso.", items: ["Evaluación guiada de lectura y escritura", "Resultados y sugerencias de apoyo para revisar", "Historial de evaluaciones por estudiante"], href: "/registro", action: "Probar como docente", family: false },
  { icon: Layers3, title: "Para profesionales", subtitle: "Reúne la información que apoya tu valoración.", items: ["Registro de lectoescritura y psicomotricidad opcional", "Informes con sugerencias de IA para revisión profesional", "Portafolio y comparación de puntajes registrados"], href: "/demo", action: "Explorar un informe", family: false },
  { icon: Building2, title: "Para unidades educativas", subtitle: "Conoce cómo incorporar SIDEDA a tu institución.", items: ["Presentación del recorrido de evaluación docente", "Revisión de las necesidades de tu equipo", "Coordinación del alcance y las condiciones de acceso"], href: "mailto:fcalderon@vir-ia.com?subject=SIDEDA%20para%20mi%20unidad%20educativa", action: "Consultar para mi institución", family: false },
]

const journeys = [
  { title: "En casa", subtitle: "Para mamá, papá o responsable", icon: HeartHandshake, steps: [
    ["Observa", "Responde seis preguntas sobre lectura, escritura y rutinas. Si algo no lo has observado, puedes indicarlo."],
    ["Revisa", "Consulta un resumen de tus respuestas y sugerencias prácticas, sin diagnósticos ni puntajes de riesgo."],
    ["Conversa", "Edita o imprime el registro y decide si quieres compartirlo con su docente."],
  ] },
  { title: "En el aula o la consulta", subtitle: "Para docentes y profesionales", icon: BookOpen, steps: [
    ["Registra", "Crea la ficha del estudiante y completa los ejercicios aplicados. Puedes retomar una evaluación pendiente."],
    ["Comprende", "Revisa los puntajes y los apartados pendientes. Con acceso ampliado, genera sugerencias de apoyo con IA."],
    ["Acompaña", "Revisa el informe antes de compartirlo y consulta el historial para preparar el siguiente encuentro."],
  ] },
]

const questions = [
  ["¿Puedo usar SIDEDA si soy mamá o papá?", "Sí. Crea una cuenta con el perfil Madre, padre o responsable. El recorrido familiar permite registrar observaciones de niños y niñas de 6 a 12 años, sin necesidad de aplicar una evaluación docente."],
  ["¿Qué incluye la prueba gratuita?", "La cuenta familiar incluye un registro de observaciones, editable e imprimible. La cuenta docente incluye un estudiante, una evaluación y un resumen de resultados. No se solicita tarjeta. Eliminar registros no renueva el cupo."],
  ["¿La evaluación familiar produce un diagnóstico?", "No. Es un cuestionario de observación educativa, no una prueba estandarizada. Resume lo que la familia registra y ofrece sugerencias para conversar con el docente. No compara al niño con otros ni asigna un nivel clínico."],
  ["¿Cómo se utiliza la inteligencia artificial?", "En los informes profesionales, los hallazgos se construyen a partir de los puntajes registrados. La IA propone actividades de apoyo que deben revisarse antes de aplicarlas o compartirlas. Las respuestas del cuestionario familiar no se envían a la IA."],
  ["¿La familia y el docente comparten automáticamente sus datos?", "No. Cada familia tiene su propio espacio. Puede imprimir el resumen y compartirlo por su cuenta. Actualmente no existe una vinculación automática entre la cuenta familiar y la cuenta docente."],
  ["¿Cómo amplío mi acceso?", "Desde tu cuenta puedes enviar una solicitud de suscripción. Nuestro equipo revisa la solicitud y acuerda contigo las condiciones antes de activar el acceso. No hay cobros automáticos."],
]

export default function LandingPage() {
  return <div className="min-h-screen bg-[#fafaf7] text-slate-900">
    <ProductHeader />
    <main>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 lg:grid-cols-[1.12fr_1fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div>
          <p className="mb-6 text-xs font-semibold uppercase leading-relaxed tracking-[0.16em] text-viria-700">Familias · Docentes · Profesionales · Unidades educativas</p>
          <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[60px]">Acompañar su aprendizaje<br /><span className="text-viria-700">empieza por comprenderlo.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600">SIDEDA ayuda a observar la lectura y la escritura, organizar los resultados y encontrar el siguiente paso. Desde el aula, la consulta o tu hogar.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/registro?perfil=familia" className="inline-flex items-center gap-3 rounded-full bg-viria-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-viria-800">Soy mamá, papá o responsable <ArrowRight size={18} className="shrink-0" /></Link>
            <Link href="/registro" className="inline-flex items-center gap-2 rounded-full border border-viria-900/30 bg-white px-6 py-3.5 text-sm font-semibold text-viria-900 transition hover:bg-viria-50">Soy docente o profesional <ArrowUpRight size={17} className="shrink-0" /></Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Elige tu recorrido y pruébalo gratis. Sin tarjeta.</p>
          <Link href="/demo" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-viria-800 underline underline-offset-4">Ver un ejemplo antes de registrarme <ArrowUpRight size={16} /></Link>
        </div>
        <div className="rounded-[28px] bg-[#e7eeeb] p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-viria-900"><span className="font-semibold">Dos miradas. Un mismo aprendizaje.</span><span className="rounded-full border border-viria-900/15 px-2.5 py-1">Ejemplos ilustrativos</span></div>
          <div className="rounded-2xl border border-white bg-white p-5 shadow-[0_20px_60px_-30px_rgba(1,50,58,0.3)] sm:p-6">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-viria-50 p-2.5 text-viria-700"><HeartHandshake size={22} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">La mirada de la familia</p><h2 className="mt-1 font-semibold">Lo que observamos en casa</h2></div></div>
            <p className="mt-5 text-sm leading-relaxed text-slate-600">“Cuando leemos juntos, a veces necesita ayuda para contar lo que pasó en la historia.”</p>
            <div className="mt-4 rounded-xl bg-[#f4f6f0] p-4"><p className="text-xs font-semibold text-viria-800">Una idea para acompañar</p><p className="mt-2 text-sm leading-relaxed text-slate-600">Conversar sobre un cuento breve y dejar que lo relate con sus propias palabras, sin presión.</p></div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/80 bg-white/70 p-5 sm:p-6"><div className="flex items-center gap-3"><FileText size={22} className="shrink-0 text-viria-700" /><h2 className="font-semibold">La mirada del docente</h2></div><p className="mt-3 text-sm leading-relaxed text-slate-600">Ejercicios registrados, resultados por área y sugerencias de apoyo para revisar antes de compartir.</p></div>
          <p className="mt-5 text-xs leading-relaxed text-slate-600">Cada perfil tiene su propio espacio. La familia decide si comparte su resumen.</p>
        </div>
      </section>

      <section id="soluciones" className="scroll-mt-6 border-y border-slate-200 bg-white px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-viria-700">Un espacio para cada forma de acompañar</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">Para familias, docentes, profesionales <br className="hidden lg:block" />y unidades educativas.</h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">En casa y en el aula se observan cosas distintas. SIDEDA ofrece un recorrido adecuado para cada persona que acompaña el aprendizaje.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{audiences.map(({icon: Icon,title,subtitle,items,href,action,family}) => <article key={title} className={`flex flex-col rounded-2xl border p-6 ${family ? "border-viria-200 bg-viria-50" : "border-slate-200 bg-[#fafaf7]"}`}><Icon size={27} strokeWidth={1.5} className="text-viria-700" /><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-600">{subtitle}</p><ul className="mb-7 mt-6 space-y-4">{items.map(item => <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-700"><Check size={16} className="mt-1 shrink-0 text-viria-700" />{item}</li>)}</ul><Link href={href} className="mt-auto inline-flex items-center justify-between gap-3 border-t border-slate-200 pt-5 text-sm font-semibold text-viria-800 underline-offset-4 hover:underline">{action}<ArrowUpRight size={17} className="shrink-0" /></Link></article>)}</div>
        </div>
      </section>

      <section id="como-funciona" className="mx-auto max-w-7xl scroll-mt-6 px-5 py-16 lg:px-8 lg:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-viria-700">Así funciona SIDEDA</p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">De lo que observas a lo que puedes hacer.</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">{journeys.map(({title,subtitle,icon: Icon,steps}) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><div className="flex items-center gap-4"><Icon size={27} className="text-viria-700" /><div><h3 className="text-xl font-semibold">{title}</h3><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div></div><ol className="mt-8 space-y-7">{steps.map(([heading,text],i) => <li key={heading} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-viria-50 text-xs font-semibold text-viria-700">0{i+1}</span><div><h4 className="font-semibold">{heading}</h4><p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p></div></li>)}</ol></article>)}</div>
      </section>

      <section id="prueba" className="scroll-mt-6 bg-viria-900 px-5 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl"><p className="text-xs font-medium uppercase tracking-[0.2em] text-viria-200">Empieza con algo concreto</p><h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Conoce SIDEDA con tu propia cuenta.</h2><p className="mt-5 max-w-2xl leading-relaxed text-viria-100">La prueba es gratuita y tiene un cupo definido según tu perfil. Puedes explorar con datos ficticios antes de registrar información real.</p>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            <article className="flex flex-col rounded-2xl border border-white/20 bg-white/5 p-6 sm:p-8"><h3 className="text-xl font-semibold">Prueba para familias</h3><p className="mt-4 text-3xl font-semibold">1 registro en casa</p><p className="mt-3 mb-7 text-sm leading-relaxed text-viria-100">Seis preguntas, resumen de observaciones y sugerencias prácticas. Puedes editarlo e imprimirlo.</p><Link href="/registro?perfil=familia" className="mt-auto inline-flex items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-viria-900">Crear mi cuenta familiar <ArrowRight size={17} /></Link></article>
            <article className="flex flex-col rounded-2xl border border-white/20 bg-white/5 p-6 sm:p-8"><h3 className="text-xl font-semibold">Prueba para docentes y profesionales</h3><p className="mt-4 text-3xl font-semibold">1 estudiante · 1 evaluación</p><p className="mt-3 mb-7 text-sm leading-relaxed text-viria-100">Registro guiado y resumen de resultados. Los informes completos con sugerencias de IA requieren ampliar el acceso.</p><Link href="/registro" className="mt-auto inline-flex items-center justify-between gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-viria-900">Crear mi cuenta docente <ArrowRight size={17} /></Link></article>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-viria-100">Sin tarjeta ni cobros automáticos. Para continuar con más registros, solicita ampliar el acceso desde tu cuenta y acordamos contigo las condiciones.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[0.8fr_1fr] lg:px-8 lg:py-20">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-viria-700">Información clara para decidir</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">Orientación educativa.<br />Con criterio y cuidado.</h2><p className="mt-5 max-w-lg text-sm leading-relaxed text-slate-600">Los registros ayudan a organizar observaciones y preparar acciones de apoyo. Los datos pendientes se identifican como tales y las sugerencias de IA requieren revisión profesional.</p><p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600">El recorrido familiar es una observación en casa. No sustituye una evaluación docente o profesional ni permite establecer un diagnóstico.</p><Link href="/acerca" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-viria-800 underline underline-offset-4">Conocer el alcance y los instrumentos <ArrowUpRight size={16} /></Link></div>
        <div><h3 className="mb-5 text-xl font-semibold">Preguntas frecuentes</h3><div className="space-y-3">{questions.map(([q,a]) => <details key={q} className="rounded-xl border border-slate-200 bg-white px-5 py-4"><summary className="cursor-pointer text-sm font-semibold leading-relaxed text-slate-800">{q}</summary><p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p></details>)}</div></div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8"><div className="flex flex-col items-start justify-between gap-7 rounded-2xl border border-viria-200 bg-[#e7eeeb] p-7 sm:p-10 lg:flex-row lg:items-center"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-viria-700">SIDEDA · Un producto de VirIA</p><h2 className="mt-4 text-2xl font-semibold tracking-tight">Conversemos sobre lo que necesitas.</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">Si tienes dudas sobre tu perfil, el acceso ampliado o el uso en tu unidad educativa, escríbenos. Te ayudamos a conocer el recorrido adecuado.</p><a href="mailto:fcalderon@vir-ia.com" className="mt-4 inline-block break-all text-sm font-semibold text-viria-800 underline underline-offset-4">fcalderon@vir-ia.com</a></div><a href="mailto:fcalderon@vir-ia.com?subject=Quiero%20conocer%20SIDEDA" className="inline-flex shrink-0 items-center gap-3 rounded-full bg-viria-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-viria-800">Contactar al equipo <ArrowUpRight size={18} /></a></div></section>
    </main>
    <ProductFooter />
  </div>
}
