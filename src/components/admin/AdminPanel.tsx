"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Shield, User, ToggleLeft, ToggleRight, Database } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Usuario {
  id: string
  email: string
  nombre: string
  rol: string
  activo: boolean
  createdAt: Date
}

export function AdminPanel({ usuarios, currentUserId }: { usuarios: Usuario[]; currentUserId: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("todos")
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const normalize = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  const filtered = usuarios.filter(u => normalize(`${u.nombre} ${u.email}`).includes(normalize(query.trim()))
    && (status === "todos" || (status === "activos" ? u.activo : !u.activo)))
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rol, setRol] = useState("DOCENTE")

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, rol }),
      })
      if (!res.ok) {
        const data = await res.json()
        setMessage({ text: data.error || "No se pudo crear la cuenta", error: true })
        return
      }
      setMessage({ text: "Cuenta creada. Entrega las credenciales directamente a la persona correspondiente.", error: false })
      setShowForm(false)
      setNombre(""); setEmail(""); setPassword(""); setRol("DOCENTE")
      router.refresh()
    } catch {
      setMessage({ text: "No se pudo conectar. Intenta crear la cuenta nuevamente.", error: true })
    } finally {
      setLoading(false)
    }
  }

  async function toggleActivo(id: string, activo: boolean) {
    setPendingId(id); setMessage(null)
    try {
      const response = await fetch(`/api/admin/usuarios/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activo: !activo }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "No se pudo actualizar la cuenta")
      setMessage({ text: activo ? "Cuenta desactivada para nuevos inicios de sesión." : "Cuenta activada.", error: false })
      router.refresh()
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "No se pudo conectar. Intenta nuevamente.", error: true })
    } finally { setPendingId(null) }
  }

  const [migrating, setMigrating] = useState(false)
  async function ejecutarMigracion() {
    if (!confirm("Ejecutar migración: agregar campo 'codigo' a estudiantes existentes. ¿Continuar?")) return
    setMigrating(true)
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" })
      const data = await res.json()
      const log = (data.log || []).join("\n")
      alert(res.ok ? `✅ Migración exitosa\n\n${log}` : `❌ Error\n\n${log}`)
      router.refresh()
    } catch (e) {
      alert("Error de red al ejecutar migración")
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">{[
        ["Cuentas", usuarios.length], ["Activas", usuarios.filter(u=>u.activo).length], ["Inactivas", usuarios.filter(u=>!u.activo).length],
      ].map(([label,count])=><div key={label} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-slate-900">{count}</p></div>)}</div>
      {message && <p role={message.error ? "alert" : "status"} className={`rounded-xl border p-4 text-sm ${message.error ? "border-red-200 bg-red-50 text-red-700" : "border-viria-100 bg-viria-50 text-viria-800"}`}>{message.text}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-viria-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-viria-700"
        >
          <UserPlus className="h-4 w-4" />
          {showForm ? "Cancelar" : "Crear nuevo usuario"}
        </button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Nuevo usuario</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={crearUsuario} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nombre completo *</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} required
                  className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Correo electrónico *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Contraseña *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Rol</label>
                <select value={rol} onChange={(e) => setRol(e.target.value)}
                  className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500">
                  <option value="DOCENTE">Docente</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {loading ? "Creando..." : "Crear usuario"}
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Accesos del equipo</CardTitle>
          <div className="flex flex-wrap gap-3 pt-3">
            <input type="search" aria-label="Buscar usuarios por nombre o correo" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar nombre o correo…" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"/>
            <select aria-label="Filtrar por estado de la cuenta" value={status} onChange={e=>setStatus(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"><option value="todos">Todas las cuentas</option><option value="activos">Activas</option><option value="inactivos">Inactivas</option></select>
          </div>
          <p className="pt-2 text-xs text-slate-500">{filtered.length} de {usuarios.length} cuentas</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No hay cuentas que coincidan con tu búsqueda.</p>}
            {filtered.map((u) => (
              <div key={u.id} className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border-2 ${u.activo ? "border-slate-200 bg-white" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-3">
                  {u.rol === "ADMIN" ? <Shield className="h-5 w-5 text-purple-500" /> : <User className="h-5 w-5 text-viria-500" />}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{u.nombre}{u.id === currentUserId && <span className="ml-2 text-xs font-normal text-viria-700">Tu cuenta</span>}</p>
                    <p className="text-xs text-slate-500">{u.email} · {u.rol === "ADMIN" ? "Administrador" : "Docente"}</p>
                  </div>
                </div>
                <button disabled={pendingId !== null || u.id === currentUserId} aria-label={`${pendingId === u.id ? "Guardando…" : u.activo ? "Desactivar" : "Activar"} cuenta de ${u.nombre}`} onClick={() => toggleActivo(u.id, u.activo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${u.activo ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}>
                  {u.activo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {pendingId === u.id ? "Guardando…" : u.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <details className="rounded-xl border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-500">Mantenimiento avanzado</summary>
        <p className="my-3 text-xs text-slate-500">Herramienta para instalaciones anteriores. No es necesaria para crear cuentas o evaluar estudiantes.</p>
        <button
          onClick={ejecutarMigracion}
          disabled={migrating}
          className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          <Database className="h-4 w-4" />
          {migrating ? "Migrando..." : "Migrar códigos"}
        </button>
      </details>
    </div>
  )
}
