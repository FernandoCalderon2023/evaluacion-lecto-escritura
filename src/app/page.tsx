import Link from "next/link"
import { BookOpen, Brain, BarChart3, FileText, Users, Shield, ArrowRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-400" />
            <span className="font-bold text-lg">SIDEDA</span>
          </div>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Ingresar al sistema
          </Link>
        </nav>

        <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24 text-center">
          <div className="inline-block bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-xs font-medium text-blue-300 mb-6">
            Plataforma con Inteligencia Artificial
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-blue-400">SIDEDA</span>
            <br />
            <span className="text-2xl lg:text-3xl font-semibold text-slate-300">
              Sistema de Evaluación de Dificultades de Aprendizaje
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Plataforma psicopedagógica que automatiza la detección y evaluación de dificultades
            en lecto-escritura y desarrollo psicomotor, generando informes integrales
            con inteligencia artificial para docentes de educación primaria en Bolivia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              Comenzar evaluación
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 border border-slate-500 text-slate-300 px-8 py-3.5 rounded-xl text-base font-medium hover:bg-white/10 transition-colors"
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
          <div className="border-2 border-blue-100 rounded-2xl p-6 bg-blue-50/50">
            <div className="bg-blue-600 text-white rounded-xl w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Instrumento MINEDU 2012</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instrumento para la Detección y Evaluación de las Dificultades en el Aprendizaje
              de Lecto-Escritura del Ministerio de Educación del Estado Plurinacional de Bolivia.
              16 ejercicios que evalúan lectura, procesos cognitivos, léxicos y escritura.
            </p>
          </div>
          <div className="border-2 border-purple-100 rounded-2xl p-6 bg-purple-50/50">
            <div className="bg-purple-600 text-white rounded-xl w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">BPM — Da Fonseca</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Batería Psicomotora de Víctor da Fonseca (1975). Evalúa 7 factores psicomotores:
              tonicidad, equilibrio, lateralidad, noción del cuerpo, estructuración espacio-temporal,
              praxia global y praxia fina.
            </p>
          </div>
          <div className="border-2 border-green-100 rounded-2xl p-6 bg-green-50/50">
            <div className="bg-green-600 text-white rounded-xl w-12 h-12 flex items-center justify-center mb-4">
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
                desc: "Ingrese los datos del estudiante: nombre, edad, año de escolaridad, unidad educativa. El evaluador registra sus observaciones iniciales.",
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
                desc: "La inteligencia artificial analiza los resultados, cruza con el currículo y genera un informe integrado con: perfil DAE, perfil psicomotor, perfil integrado, fortalezas, recomendaciones para el aula y la familia.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mb-4">
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
            <div className="inline-block bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-semibold mb-4">
              Inteligencia Artificial
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
              Análisis potenciado por Claude AI
            </h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              SIDEDA utiliza Claude de Anthropic para generar informes psicopedagógicos profesionales.
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
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Informe generado por IA</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-blue-300 font-semibold text-xs mb-1">PERFIL DAE</p>
                <p className="text-slate-300 text-xs">Análisis de dificultades en lecto-escritura cruzado con el currículo R.M. 1040/2022...</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-300 font-semibold text-xs mb-1">PERFIL PSICOMOTOR</p>
                <p className="text-slate-300 text-xs">Síntesis descriptiva del perfil BPM: tonicidad, equilibrio, lateralidad...</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-indigo-300 font-semibold text-xs mb-1">PERFIL INTEGRADO</p>
                <p className="text-slate-300 text-xs">Cómo el perfil psicomotor se relaciona con las dificultades de lecto-escritura...</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-green-300 font-semibold text-xs mb-1">RECOMENDACIONES</p>
                <p className="text-slate-300 text-xs">Estrategias para el aula, la familia y plan de seguimiento...</p>
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

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            <span className="font-bold text-white">SIDEDA</span>
            <span className="text-xs">· sideda.com</span>
          </div>
          <p className="text-xs text-center sm:text-right">
            Sistema de Evaluación de Dificultades de Aprendizaje · Potenciado por Claude AI (Anthropic)
          </p>
        </div>
      </footer>
    </div>
  )
}
