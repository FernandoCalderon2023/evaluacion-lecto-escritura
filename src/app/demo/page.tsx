import type { Metadata } from "next"
import { ProductHeader, ProductFooter } from "@/components/marketing/ProductShell"
import { ReportDemo } from "@/components/marketing/ReportDemo"

export const metadata: Metadata = { title: "Ejemplo de informe | SIDEDA", description: "Explora un ejemplo ficticio de informe para profesionales y familias. Sin registro y sin datos de estudiantes reales." }
export default function DemoPage() {
  return <div className="min-h-screen bg-[#fafaf7]"><ProductHeader /><main className="mx-auto max-w-6xl px-5 py-12 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-viria-700">Conoce el resultado</p><h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Información que se convierte en apoyo.</h1><p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">Elige una vista para explorar cómo se organiza un informe. Esta muestra es ficticia e ilustrativa: no es una evaluación aplicada ni un resultado de diagnóstico.</p><ReportDemo /></main><ProductFooter /></div>
}
