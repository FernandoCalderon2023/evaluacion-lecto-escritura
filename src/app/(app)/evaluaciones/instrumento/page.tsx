import Link from "next/link"
import { InstrumentViewer } from "@/components/evaluacion/InstrumentViewer"
export default function InstrumentPage() {
 return <main className="mx-auto max-w-5xl space-y-5 p-4 lg:p-8"><Link href="/evaluaciones" className="text-sm underline">Volver a evaluaciones</Link><h1 className="text-2xl font-semibold">Cuadernillo de evaluación SIDEDA</h1><p className="text-sm text-slate-600">Actividades adaptadas a pantalla y papel, con ilustraciones vectoriales SIDEDA. Referencia: instrumento de lectoescritura del Ministerio de Educación de Bolivia (2012). La nueva presentación requiere revisión profesional antes de su aplicación; no cambia los criterios del registro ni acredita equivalencia validada.</p><InstrumentViewer expanded /></main>
}
