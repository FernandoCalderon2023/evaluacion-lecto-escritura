import Link from "next/link"
import { BookOpen, ArrowLeft, Shield } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidad — SIDEDA",
  description: "Cómo SIDEDA recopila, almacena y protege los datos personales de los estudiantes",
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-viria-400" />
            <span className="font-bold">SIDEDA</span>
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 prose prose-slate">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-extrabold text-slate-900 m-0">Política de Privacidad</h1>
        </div>
        <p className="text-sm text-slate-500 mb-8">
          Última actualización: {new Date().toLocaleDateString("es-BO")}
        </p>

        <section className="space-y-6 text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">1. Datos que recopilamos</h2>
            <p>SIDEDA recopila únicamente los datos estrictamente necesarios para realizar evaluaciones psicopedagógicas:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Del docente evaluador:</strong> nombre, correo electrónico, contraseña (cifrada con bcrypt).</li>
              <li><strong>Del estudiante (menor de edad):</strong> nombre y apellidos, fecha de nacimiento, sexo, grado, Unidad Educativa, código RUDE opcional, domicilio opcional.</li>
              <li><strong>Resultados de evaluación:</strong> puntuaciones por ejercicio del instrumento MINEDU 2012 y de la Batería Psicomotora (BPM).</li>
              <li><strong>Datos técnicos:</strong> dirección IP, navegador y momento de cada acción sensible (para auditoría).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">2. Anonimización de menores</h2>
            <p>
              Al registrar un estudiante, la plataforma genera automáticamente un{" "}
              <strong>código anónimo</strong> (formato: iniciales + sufijo, ej. <code>QMM-A1B2</code>).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>En todos los listados, dashboards y reportes se muestra <strong>únicamente el código</strong>.</li>
              <li>El nombre completo solo es visible para el docente que registró al estudiante.</li>
              <li>El prompt enviado a la inteligencia artificial recibe <strong>solo el código</strong> — nunca el nombre real.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">3. Inteligencia Artificial</h2>
            <p>
              Los reportes psicopedagógicos se generan utilizando <strong>Claude (Anthropic)</strong>.
              El proveedor de IA recibe únicamente los puntajes numéricos, el código anónimo y los datos
              demográficos básicos (sexo, edad, grado). Nunca recibe el nombre del estudiante.
            </p>
            <p className="text-sm text-slate-600">
              Anthropic mantiene logs operativos por 30 días para fines de seguridad, pero no entrena
              sus modelos con datos del API. Más información: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-viria-600 hover:underline">anthropic.com/privacy</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">4. Almacenamiento y seguridad</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Los datos se almacenan en <strong>Turso</strong> (libSQL distribuido) con replicación automática.</li>
              <li>La plataforma corre en <strong>Vercel</strong> con TLS 1.3 obligatorio.</li>
              <li>Las contraseñas se almacenan <strong>cifradas con bcrypt</strong> (12 rounds). Nadie — ni el administrador — puede verlas.</li>
              <li><strong>Backups diarios</strong> cifrados, conservados 14 días.</li>
              <li><strong>Audit log</strong> de todas las acciones sensibles (creación de usuarios, accesos administrativos).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">5. Aislamiento por docente</h2>
            <p>
              Cada docente solo puede ver y administrar los estudiantes que él mismo registró. No es
              posible acceder a datos de otros docentes ni de otras Unidades Educativas. Solo el
              administrador del sistema tiene visibilidad global, con fines exclusivos de soporte.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">6. Derechos del estudiante y la familia</h2>
            <p>
              Los padres, madres o tutores legales del estudiante tienen derecho a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Solicitar acceso a todos los datos registrados sobre su hijo/a.</li>
              <li>Solicitar la rectificación de datos incorrectos.</li>
              <li>Solicitar la eliminación de los datos (derecho al olvido).</li>
              <li>Conocer qué reportes de IA se han generado sobre el menor.</li>
            </ul>
            <p className="text-sm">
              Estas solicitudes deben dirigirse al docente responsable o a la Unidad Educativa,
              quienes coordinarán con el administrador del sistema.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">7. Limitaciones de la inteligencia artificial</h2>
            <p className="text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
              <strong>Importante:</strong> Los reportes generados por SIDEDA son una herramienta de
              apoyo para el docente. <strong>No reemplazan</strong> la evaluación profesional de un
              psicopedagogo, fonoaudiólogo o psicólogo. Las recomendaciones deben ser adaptadas al
              contexto particular del estudiante.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">8. Marco legal</h2>
            <p className="text-sm">
              SIDEDA opera bajo el marco de la <strong>Ley 070 Avelino Siñani — Elizardo Pérez</strong> de
              Bolivia, el Código Niña, Niño y Adolescente (Ley 548), y se alinea con los principios
              de la <strong>R.M. 1040/2022</strong> del Ministerio de Educación.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">9. Contacto</h2>
            <p className="text-sm">
              Para cualquier consulta sobre el tratamiento de datos personales, contactar a:<br />
              <strong>Lic. Lourdes Olivares Franquel</strong><br />
              Universidad Católica Boliviana
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-slate-200 text-center">
          <Link href="/" className="text-viria-600 hover:underline text-sm">← Volver al inicio</Link>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        SIDEDA · sideda.com · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
