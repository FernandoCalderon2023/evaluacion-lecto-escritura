"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { FAMILY_ITEMS, FAMILY_ANSWERS, type FamilyInput } from "@/lib/family"
export function FamilyForm({ initial }: { initial?: FamilyInput }) {
 const router = useRouter()
 const [id] = useState(() => initial?.id ?? crypto.randomUUID())
 const [busy, setBusy] = useState(false), [error, setError] = useState("")
 async function submit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault(); setBusy(true); setError("")
  const data = new FormData(event.currentTarget)
  try {
   const response = await fetch("/api/familia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, alias: data.get("alias"), edad: Number(data.get("edad")), respuestas: Object.fromEntries(FAMILY_ITEMS.map(i => [i.id, data.get(i.id)])), autoriza: data.get("autoriza") === "on" }) })
   const result = await response.json()
   if (!response.ok) throw new Error(result.error || "No se pudo guardar.")
   router.push(result.href); router.refresh()
  } catch (e) { setError(e instanceof Error ? e.message : "No se pudo conectar. Intenta nuevamente.") } finally { setBusy(false) }
 }
 return <form onSubmit={submit} className="space-y-6">
  <section className="rounded-xl border border-viria-200 bg-viria-50 p-4 text-sm text-slate-700"><h2 className="font-semibold text-viria-900">¿Qué completa mamá, papá o el responsable?</h2><p className="mt-2">Las preguntas de este registro las responde el adulto que ha observado al niño en casa. Puedes completarlas como mamá, papá u otro responsable autorizado; no es necesario que participen ambos progenitores.</p><p className="mt-2">Describe lo que tú observas. Si no has visto una actividad, elige «No observado». Este espacio recoge observaciones familiares; la corrección del examen y la valoración de escritura corresponden al profesional, con revisión del psicopedagogo.</p></section>
  <fieldset disabled={busy} className="grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2"><legend className="px-2 font-semibold">Para identificar este registro</legend><label className="text-sm">Apodo o iniciales (sin nombre completo)<input name="alias" defaultValue={initial?.alias} maxLength={30} required className="mt-2 w-full rounded-lg border p-3" autoComplete="off"/></label><label className="text-sm">Edad (6 a 12 años)<input name="edad" defaultValue={initial?.edad} type="number" min={6} max={12} required className="mt-2 w-full rounded-lg border p-3"/></label></fieldset>
  {FAMILY_ITEMS.map((item, index) => <fieldset key={item.id} disabled={busy} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><legend className="max-w-full px-2 text-lg font-semibold">{index + 1}. {item.titulo}</legend><p className="text-sm leading-relaxed text-slate-600">{item.actividad}</p><p className="my-4 font-medium">{item.pregunta}</p><div className="grid gap-2 sm:grid-cols-2">{FAMILY_ANSWERS.map(answer => <label key={answer.value} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm has-[:checked]:border-viria-600 has-[:checked]:bg-viria-50"><input type="radio" name={item.id} value={answer.value} defaultChecked={initial?.respuestas[item.id] === answer.value} required className="mt-1 shrink-0"/><span>{answer.label}</span></label>)}</div></fieldset>)}
  <label className="flex items-start gap-3 rounded-xl border p-4 text-sm"><input name="autoriza" type="checkbox" required disabled={busy} className="mt-1"/><span>Confirmo que soy madre, padre o responsable autorizado y que tengo autorización para registrar esta información. Entiendo que es una observación familiar, no una evaluación diagnóstica.</span></label>
  {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}
  <button disabled={busy} className="min-h-12 w-full rounded-xl bg-viria-900 px-6 py-3 font-semibold text-white disabled:opacity-50 sm:w-auto">{busy ? "Guardando…" : "Guardar y ver orientación"}</button>
 </form>
}
