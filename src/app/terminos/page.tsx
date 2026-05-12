import Link from "next/link"
import { BookOpen, ArrowLeft, FileText } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos de Uso — SIDEDA",
  description: "Términos y condiciones de uso de la plataforma SIDEDA",
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span className="font-bold">SIDEDA</span>
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-extrabold text-slate-900 m-0">Términos de Uso</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">Última actualización: {new Date().toLocaleDateString("es-BO")}</p>

        <section className="space-y-6 text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Aceptación</h2>
            <p className="text-sm">
              Al ingresar y utilizar SIDEDA, el/la docente acepta estos Términos de Uso y la{" "}
              <Link href="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link>.
              Si no está de acuerdo, no debe utilizar la plataforma.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Acceso restringido</h2>
            <p className="text-sm">
              El acceso a SIDEDA es <strong>solo por invitación</strong>. Las cuentas son creadas
              por el administrador del sistema. No existe registro público auto-servicio. Las
              credenciales son personales e intransferibles.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. Uso permitido</h2>
            <p className="text-sm">SIDEDA está destinado exclusivamente a:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Docentes de educación primaria autorizados.</li>
              <li>Evaluación psicopedagógica de estudiantes a quienes se les aplicó los instrumentos físicos.</li>
              <li>Generación de reportes con fines educativos y de apoyo profesional.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Uso prohibido</h2>
            <p className="text-sm">El docente se compromete a NO:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Compartir su contraseña con terceros.</li>
              <li>Ingresar datos falsos o de estudiantes que no haya evaluado personalmente.</li>
              <li>Utilizar los reportes generados como diagnóstico clínico definitivo.</li>
              <li>Hacer scraping, ingeniería inversa o reproducir la plataforma.</li>
              <li>Compartir reportes con personas no autorizadas (padres exceptuados, dentro del contexto del estudiante).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. Responsabilidad profesional</h2>
            <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              Los reportes de SIDEDA son <strong>herramienta de apoyo</strong>, no diagnóstico clínico.
              Para diagnóstico formal de dificultades de aprendizaje, derive al estudiante a un
              psicopedagogo, fonoaudiólogo o psicólogo licenciado.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">6. Disponibilidad del servicio</h2>
            <p className="text-sm">
              La plataforma busca operar 24/7 pero puede sufrir interrupciones por mantenimiento,
              actualizaciones o fallas de infraestructura. No se garantiza disponibilidad absoluta.
              En caso de cortes prolongados, los datos no se pierden — se restauran desde los backups.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">7. Propiedad intelectual</h2>
            <p className="text-sm">
              SIDEDA es propiedad de <strong>Lic. Lourdes Olivares Franquel</strong>. Los instrumentos
              MINEDU 2012 y BPM de Da Fonseca son propiedad de sus respectivos autores y editores.
              El uso de SIDEDA no transfiere derechos de propiedad intelectual al usuario.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">8. Modificaciones</h2>
            <p className="text-sm">
              Estos términos pueden actualizarse. Las modificaciones entran en vigor al publicarse
              en esta página. El uso continuado de la plataforma implica aceptación de los términos
              vigentes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">9. Jurisdicción</h2>
            <p className="text-sm">
              Estos términos se rigen por las leyes del Estado Plurinacional de Bolivia. Cualquier
              disputa será resuelta en los tribunales competentes de Bolivia.
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-slate-200 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">← Volver al inicio</Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        SIDEDA · sideda.com · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
