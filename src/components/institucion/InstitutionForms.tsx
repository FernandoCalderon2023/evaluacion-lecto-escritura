"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function InstitutionUserForm({ provision = false }: { provision?: boolean }) {
 const router = useRouter()
 const [busy, setBusy] = useState(false)
 const [message, setMessage] = useState("")
 return <form className="space-y-4 rounded-xl border bg-white p-5" onSubmit={async e => {
  e.preventDefault(); if (busy) return
  const form = e.currentTarget; const values = new FormData(form)
  const responsable = { nombre: String(values.get("nombre")), email: String(values.get("email")), password: String(values.get("password")) }
  setBusy(true); setMessage("")
  try {
   const response = await fetch(provision ? "/api/admin/instituciones" : "/api/institucion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(provision ? { institucion: values.get("institucion"), responsable } : responsable) })
   const data = await response.json()
   if (!response.ok) throw new Error(data.error || "No se pudo guardar.")
   form.reset(); setMessage(provision ? "Institución preparada: 10 cuentas en total, incluido el responsable, y 15 evaluaciones compartidas." : "Cuenta creada. Entrega las credenciales por un canal privado; no se envió correo."); router.refresh()
  } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo guardar.") } finally { setBusy(false) }
 }}>
  <h2 className="text-lg font-semibold">{provision ? "Preparar institución pagada" : "Crear una cuenta del equipo"}</h2>
  {provision && <label className="block text-sm">Institución<input name="institucion" required minLength={2} maxLength={160} className="mt-1 w-full rounded-lg border p-3"/></label>}
  <label className="block text-sm">{provision ? "Nombre del responsable" : "Nombre"}<input name="nombre" required minLength={2} maxLength={100} className="mt-1 w-full rounded-lg border p-3"/></label>
  <label className="block text-sm">Correo<input name="email" type="email" required maxLength={254} className="mt-1 w-full rounded-lg border p-3"/></label>
  <label className="block text-sm">Contraseña inicial (12–72 caracteres)<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={72} className="mt-1 w-full rounded-lg border p-3"/></label>
  <p className="text-sm text-slate-600">Cada persona tendrá acceso a sus propios alumnos y evaluaciones. El responsable administra las cuentas y el consumo; no obtiene acceso a los expedientes de otros usuarios. No se envían credenciales por correo desde este formulario.</p>
  {provision && <p className="text-sm font-medium">10 cuentas, incluido el responsable. 15 evaluaciones para toda la institución. Esta acción habilita el paquete acordado; no procesa un pago.</p>}
  <button disabled={busy} className="min-h-12 rounded-xl bg-viria-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Guardando…" : provision ? "Habilitar paquete institucional" : "Crear cuenta"}</button>
  <p role="status" className="text-sm">{message}</p>
 </form>
}
export function InstitutionAccountToggle({ usuarioId, activo }: { usuarioId: string; activo: boolean }) {
 const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("")
 return <div><button disabled={busy} className="min-h-11 rounded-lg border px-3 py-2 text-sm" onClick={async () => {
 setBusy(true); setError("")
 try { const r = await fetch("/api/institucion", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ usuarioId, activo: !activo }) }); if (!r.ok) throw new Error((await r.json()).error); router.refresh() } catch (e) { setError(e instanceof Error ? e.message : "No se pudo actualizar.") } finally { setBusy(false) }
 }}>{busy ? "Guardando…" : activo ? "Desactivar" : "Reactivar"}</button><p role="status" className="text-sm text-red-700">{error}</p></div>
}
