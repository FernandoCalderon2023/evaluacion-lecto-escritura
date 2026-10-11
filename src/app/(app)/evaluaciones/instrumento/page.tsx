import Link from "next/link"
import { InstrumentViewer } from "@/components/evaluacion/InstrumentViewer"
export default function InstrumentPage() {
 return <main className="mx-auto max-w-5xl space-y-5 p-4 lg:p-8"><Link href="/evaluaciones" className="text-sm underline">Volver a evaluaciones</Link><h1 className="text-2xl font-semibold">Cuadernillo de evaluación</h1><p className="text-sm text-slate-600">Consulta las consignas y los dibujos originales o descarga el examen para aplicarlo en papel. La valoración de escritura requiere revisión profesional.</p><InstrumentViewer expanded /></main>
}
