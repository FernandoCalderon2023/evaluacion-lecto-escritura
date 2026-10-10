import { redirect } from "next/navigation"
import Link from "next/link"
import { getAuthContext } from "@/lib/apiAuth"
import { FamilyForm } from "@/components/familia/FamilyForm"
import { trialAccess } from "@/lib/commercial"
export default async function FamilyNewPage() {
 const auth = await getAuthContext(); if (!auth) redirect("/login?callbackUrl=/familia/nueva")
 if (auth.role !== "FAMILIA") redirect("/familia")
 const access = await trialAccess(auth.userId)
 if (access?.estado === "PRUEBA" && access.evaluacionesUsadas >= 1) redirect("/familia")
 return <main className="mx-auto max-w-3xl space-y-6 p-5 lg:p-8"><Link href="/familia" className="text-sm underline">← Mi espacio familiar</Link><h1 className="text-3xl font-semibold">Observación en casa</h1><p className="leading-relaxed text-slate-600">Piensa en las últimas dos semanas. Puedes responder a partir de lo que ya observaste; no es necesario hacer todas las actividades hoy. Si algo no se trabajó, elige «No lo he observado». Evita presionar, cronometrar o comparar. Puedes parar si hay cansancio o malestar.</p><p className="rounded-xl bg-viria-50 p-4 text-sm">Las respuestas se guardan al pulsar «Guardar y ver orientación». Este registro ofrece orientación educativa, sin puntajes de riesgo ni diagnósticos.</p><FamilyForm/></main>
}
