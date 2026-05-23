import Link from "next/link"
import { BookOpen, ArrowLeft, Award, Target, Users, Shield } from "lucide-react"
import { Logo } from "@/components/branding/Logo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acerca de SIDEDA",
  description: "Sistema de Evaluación de Dificultades de Aprendizaje — Metodología, instrumentos y marco legal",
}

export default function AcercaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-viria-400" />
            <span className="font-bold">SIDEDA</span>
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">Acerca de SIDEDA</h1>
        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
          Sistema de Evaluación de Dificultades de Aprendizaje — Plataforma psicopedagógica
          asistida con Inteligencia Artificial para la educación primaria en Bolivia.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-viria-600" /> Propósito
          </h2>
          <p className="text-slate-700 leading-relaxed">
            SIDEDA automatiza el proceso de detección y evaluación de dificultades en el aprendizaje
            de lecto-escritura y desarrollo psicomotor en estudiantes de educación primaria. La
            plataforma permite a docentes y especialistas registrar los resultados de instrumentos
            estandarizados, generar análisis cruzados con el currículo oficial boliviano, y producir
            informes psicopedagógicos integrales con recomendaciones prácticas para el aula.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" /> Instrumentos validados
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-2 border-viria-100 rounded-xl p-4 bg-viria-50/50">
              <h3 className="font-bold text-slate-900 mb-1">MINEDU 2012</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instrumento para la Detección y Evaluación de las Dificultades en el Aprendizaje
                de Lecto-Escritura del Ministerio de Educación del Estado Plurinacional de Bolivia.
                16 ejercicios: lectura, procesos cognitivos, léxicos y escritura.
              </p>
            </div>
            <div className="border-2 border-purple-100 rounded-xl p-4 bg-purple-50/50">
              <h3 className="font-bold text-slate-900 mb-1">BPM — Da Fonseca</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Batería Psicomotora de Víctor da Fonseca (1975). 7 factores: tonicidad, equilibrio,
                lateralidad, noción del cuerpo, estructuración espacio-temporal, praxia global y fina.
              </p>
            </div>
            <div className="border-2 border-green-100 rounded-xl p-4 bg-green-50/50">
              <h3 className="font-bold text-slate-900 mb-1">R.M. 1040/2022</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Currículo oficial — Planes y Programas de Educación Primaria Comunitaria Vocacional.
                Expectativas curriculares por grado para evaluar desfase respecto al perfil de salida.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" /> Metodología
          </h2>
          <p className="text-slate-700 leading-relaxed mb-3">
            SIDEDA aplica una metodología de <strong>Generación Aumentada por Recuperación (RAG)</strong>,
            donde los instrumentos normativos y el currículo oficial constituyen una base de
            conocimiento estructurada. Los resultados de cada estudiante se cruzan dinámicamente con
            esa base para generar:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 ml-4">
            <li><strong>Perfil DAE</strong> — nivel de dificultad y desfase curricular</li>
            <li><strong>Perfil Psicomotor</strong> — síntesis descriptiva (no diagnóstico)</li>
            <li><strong>Perfil Integrado</strong> — cómo la psicomotricidad impacta la lecto-escritura</li>
            <li><strong>Recomendaciones</strong> — estrategias para el aula y la familia</li>
            <li><strong>Plan de seguimiento</strong> — indicadores medibles</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" /> Marco legal y ético
          </h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Enmarcado en la <strong>Ley 070 Avelino Siñani — Elizardo Pérez</strong>, el
              <strong> Modelo Educativo EPCV</strong> y la <strong>Resolución Ministerial 1040/2022</strong>.
            </p>
            <p>
              Los datos de los estudiantes — todos menores de edad — se almacenan de forma{" "}
              <strong>anonimizada mediante códigos</strong> (formato: iniciales + sufijo). El nombre
              completo solo es visible para el docente responsable y nunca aparece en los reportes
              generados por inteligencia artificial.
            </p>
            <p>
              Consulta nuestra{" "}
              <Link href="/privacidad" className="text-viria-600 hover:underline font-medium">
                Política de Privacidad
              </Link>{" "}
              y los{" "}
              <Link href="/terminos" className="text-viria-600 hover:underline font-medium">
                Términos de Uso
              </Link>.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Tecnología</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
            <div className="border border-slate-200 rounded-lg p-3">
              <p className="font-bold text-slate-900 mb-1">IA</p>
              <p>Modelo de lenguaje avanzado con caching de prompts</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <p className="font-bold text-slate-900 mb-1">Infraestructura</p>
              <p>Cloud distribuido con replicación automática</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <p className="font-bold text-slate-900 mb-1">Seguridad</p>
              <p>TLS 1.3, bcrypt, rate limiting, audit log</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-3">
              <p className="font-bold text-slate-900 mb-1">Monitoreo</p>
              <p>Sentry, Vercel Analytics, health checks</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-viria-50 to-orchid-400/5 rounded-2xl p-6 mb-10 border border-viria-100">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Autora</h2>
          <p className="text-slate-900 font-bold">Lic. Lourdes Olivares Franquel</p>
          <p className="text-sm text-slate-600 mt-1">
            Tesis de investigación en Educación Especial — Universidad Católica Boliviana
          </p>
        </section>

        <section className="text-center mb-10">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">SIDEDA es un producto de</p>
          <div className="flex justify-center mb-2">
            <Logo variant="default" size={36} showTagline={true} />
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
            VirIA desarrolla soluciones de evaluación inteligente para el contexto educativo de Latinoamérica.
          </p>
        </section>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-viria-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-viria-700"
          >
            Ingresar al sistema
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        SIDEDA · sideda.com · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
