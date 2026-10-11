import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/apiAuth"
import { Booklet } from "@/components/instrumento/Booklet"
import { PrintBookletButton } from "@/components/instrumento/PrintBookletButton"
export default async function PrintInstrumentPage({ searchParams }: { searchParams: Promise<{ parte?: string }> }) {
 const auth = await getAuthContext()
 if (!auth) redirect("/login")
 if (!["ADMIN","DOCENTE","DIRECTOR","DISTRITAL","DEPARTAMENTAL"].includes(auth.role)) redirect("/familia")
 const evaluator = (await searchParams).parte === "evaluador"
 return <div className="instrument-print-route"><header className="print:hidden mx-auto max-w-4xl space-y-3 p-4"><Link href="/evaluaciones/instrumento" className="text-sm underline">Volver al cuadernillo</Link><h1 className="text-2xl font-semibold">{evaluator ? "Hojas del evaluador" : "Cuadernillo del estudiante"}</h1><p className="text-sm text-slate-600">Plantilla SIDEDA lista para papel A4. Pulsa imprimir y elige «Guardar como PDF» en el diálogo del navegador. Desactiva los encabezados y pies del navegador para conservar el diseño.</p><PrintBookletButton/><p className="text-sm text-slate-600">Adaptación visual de las actividades del instrumento de referencia. Las ilustraciones nuevas y la aplicación deben revisarse profesionalmente; no se afirma equivalencia validada.</p></header><Booklet evaluator={evaluator}/></div>
}
