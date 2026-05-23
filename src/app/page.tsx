import Link from "next/link"
import { BookOpen, Brain, BarChart3, Users, Shield, ArrowRight } from "lucide-react"
import { Logo } from "@/components/branding/Logo"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="bg-gradient-to-br from-viria-900 via-viria-800 to-orchid-800 text-white relative overflow-hidden">
        {/* Decoración: nodos sutiles */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 rounded-full bg-viria-300" />
          <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-orchid-400" />
          <div className="absolute bottom-32 left-1/3 w-2 h-2 rounded-full bg-viria-200" />
        </div>

        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between relative z-10">
          <Logo variant="white" size={28} showTagline={false} />
          <Link
            href="/dashboard"
            className="bg-white/95 text-viria-800 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-white transition-colors shadow-sm"
          >
            Ingresar al sistema
          </Link>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-viria-100 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-viria-300 animate-pulse" />
            Plataforma con Inteligencia Artificial
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-4">
            <span className="bg-clip-text text-transparent bg-ia-gradient">SIDEDA</span>
          </h1>
          <p className="text-lg lg:text-2xl font-semibold text-viria-100 mb-3">
            Sistema de Evaluación de Dificultades de Aprendizaje
          </p>
          <p className="text-base lg:text-lg text-viria-200/90 max-w-3xl mx-auto mb-10 leading-relaxed">
            Plataforma psicopedagógica que automatiza la detección y evaluación de dificultades
            en lecto-escritura y desarrollo psicomotor, generando informes integrales para
            docentes de educación primaria en Bolivia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-viria-500 hover:bg-viria-400 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-colors shadow-lg shadow-viria-500/30"
            >
              Comenzar evaluación
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 border border-white/30 backdrop-blur-sm text-viria-100 px-8 py-3.5 rounded-xl text-base font-medium hover:bg-white/10 transition-colors"
            >
              Conocer más
            </a>
          </div>
        </div>
      </header>

      {/* Instrumentos */}
      <section className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">Instrumentos validados</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            SIDEDA integra dos instrumentos reconocidos internacionalmente, cruzados con el currículo oficial boliviano
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="border-2 border-viria-100 rounded-2xl p-6 bg-viria-50/40 hover:shadow-md transition-shadow">
            <div className="bg-viria-600 text-white rounded-xl w-12 h-12 flex items-center justify-center mb-4 shadow-md shadow-viria-500/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Instrumento MINEDU 2012</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instrumento para la Detección y Evaluación de las Dificultades en el Aprendizaje
              de Lecto-Escritura del Ministerio de Educación del Estado Plurinacional de Bolivia.
              16 ejercicios que evalúan lectura, procesos cognitivos, léxicos y escritura.
            </p>
          </div>
          <div className="border-2 border-orchid-400/20 rounded-2xl p-6 bg-orchid-400/5 hover:shadow-md transition-shadow">
            <div className="bg-orchid-600 text-white rounded-xl w-12 h-12 flex items-center justify-center mb-4 shadow-md shadow-orchid-500/20">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">BPM — Da Fonseca</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Batería Psicomotora de Víctor da Fonseca (1975). Evalúa 7 factores psicomotores:
              tonicidad, equilibrio, lateralidad, noción del cuerpo, estructuración espacio-temporal,
              praxia global y praxia fina.
            </p>
          </div>
          <div className="border-2 border-glacier rounded-2xl p-6 bg-glacier-light/40 hover:shadow-md transition-shadow">
            <div className="bg-viria-700 text-white rounded-xl w-12 h-12 flex items-center justify-center mb-4 shadow-md">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Currículo R.M. 1040/2022</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Los resultados se cruzan con las expectativas del currículo oficial boliviano
              (Planes y Programas EPCV) para determinar el nivel de desfase del estudiante
              respecto al perfil de salida de su grado.
            </p>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="bg-slate-50 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">¿Cómo funciona?</h2>
            <p className="text-slate-500">Tres pasos para generar un informe psicopedagógico completo</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Users,
                title: "Registrar estudiante",
                desc: "Ingrese los datos del estudiante: edad, año de escolaridad, unidad educativa. El sistema genera un código anónimo para proteger la identidad del menor.",
              },
              {
                step: "2",
                icon: BarChart3,
                title: "Completar evaluación",
                desc: "Llene los 16 ejercicios del instrumento de lecto-escritura y los 7 factores de la BPM según los resultados del cuadernillo físico. El sistema calcula los puntajes automáticamente.",
              },
              {
                step: "3",
                icon: Brain,
                title: "Generar informe con IA",
                desc: "La inteligencia artificial analiza los resultados, cruza con el currículo y genera un informe integrado con perfil DAE, perfil psicomotor, perfil integrado, fortalezas y recomendaciones.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-gradient-to-br from-viria-500 to-viria-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mb-4 shadow-md shadow-viria-500/30">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IA */}
      <section className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-orchid-400/15 text-orchid-700 rounded-full px-3 py-1 text-xs font-semibold mb-4">
              Inteligencia Artificial
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
              Análisis psicopedagógico potenciado por IA
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              SIDEDA aplica inteligencia artificial para generar informes psicopedagógicos profesionales.
              La IA no reemplaza al especialista — lo asiste proporcionando un análisis estructurado
              y recomendaciones basadas en evidencia que el docente puede adaptar a cada contexto.
            </p>
            <ul className="space-y-3">
              {[
                "Perfil de DAE en lecto-escritura con nivel de dificultad",
                "Perfil psicomotor descriptivo (no diagnóstico)",
                "Perfil integrado que cruza ambos instrumentos",
                "Recomendaciones prácticas para el aula y la familia",
                "Plan de seguimiento con indicadores medibles",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="text-viria-500 mt-0.5 shrink-0 font-bold">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-viria-900 via-viria-800 to-orchid-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-viria-300" />
              <span className="text-sm font-medium text-viria-200">Informe generado por IA</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                <p className="text-viria-300 font-semibold text-xs mb-1">PERFIL DAE</p>
                <p className="text-viria-100/80 text-xs">Análisis de dificultades en lecto-escritura cruzado con el currículo R.M. 1040/2022...</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                <p className="text-orchid-400 font-semibold text-xs mb-1">PERFIL PSICOMOTOR</p>
                <p className="text-viria-100/80 text-xs">Síntesis descriptiva del perfil BPM: tonicidad, equilibrio, lateralidad...</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                <p className="text-viria-300 font-semibold text-xs mb-1">PERFIL INTEGRADO</p>
                <p className="text-viria-100/80 text-xs">Cómo el perfil psicomotor se relaciona con las dificultades de lecto-escritura...</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                <p className="text-viria-300 font-semibold text-xs mb-1">RECOMENDACIONES</p>
                <p className="text-viria-100/80 text-xs">Estrategias para el aula, la familia y plan de seguimiento...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marco legal */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-2">Enmarcado en</p>
          <p className="text-lg font-medium">
            Ley 070 Avelino Siñani — Elizardo Pérez · Modelo Educativo EPCV · R.M. 1040/2022
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Ministerio de Educación del Estado Plurinacional de Bolivia
          </p>
        </div>
      </section>

      {/* Autora */}
      <section className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Desarrollado por</p>
          <p className="text-xl font-bold text-slate-900">Lic. Lourdes Olivares Franquel</p>
          <p className="text-slate-500 text-sm mt-1">Tesis de investigación en Educación Especial</p>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-slate-400">
            <span>SIDEDA es un producto de</span>
            <Logo variant="default" size={16} showTagline={false} className="opacity-80" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo variant="white" size={20} showText={false} />
              <div>
                <p className="font-bold text-white text-sm">SIDEDA</p>
                <p className="text-[10px] text-slate-500">sideda.com · Producto de VirIA</p>
              </div>
            </div>
            <p className="text-xs text-center sm:text-right max-w-md">
              Sistema de Evaluación de Dificultades de Aprendizaje · Potenciado por Inteligencia Artificial
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-4 border-t border-slate-800">
            <Link href="/acerca" className="hover:text-white transition-colors">Acerca de</Link>
            <span className="text-slate-700">·</span>
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <span className="text-slate-700">·</span>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos de Uso</Link>
            <span className="text-slate-700">·</span>
            <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
