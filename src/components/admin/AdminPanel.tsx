"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Shield, User, ToggleLeft, ToggleRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Usuario {
  id: string
  email: string
  nombre: string
  rol: string
  activo: boolean
  createdAt: Date
}

export function AdminPanel({ usuarios }: { usuarios: Usuario[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rol, setRol] = useState("DOCENTE")

  async function crearUsuario(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, rol }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || "Error al crear usuario")
        return
      }
      setShowForm(false)
      setNombre(""); setEmail(""); setPassword(""); setRol("DOCENTE")
      router.refresh()
    } catch {
      alert("Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  async function toggleActivo(id: string, activo: boolean) {
    await fetch(`/api/admin/usuarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
      >
        <UserPlus className="h-4 w-4" />
        {showForm ? "Cancelar" : "Crear nuevo usuario"}
      </button>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Nuevo usuario</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={crearUsuario} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nombre completo *</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} required
                  className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Correo electrónico *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Contraseña *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Rol</label>
                <select value={rol} onChange={(e) => setRol(e.target.value)}
                  className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
        <CardHeader><CardTitle className="text-base">Usuarios registrados ({usuarios.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {usuarios.map((u) => (
              <div key={u.id} className={`flex items-center justify-between p-3 rounded-lg border-2 ${u.activo ? "border-slate-200 bg-white" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-3">
                  {u.rol === "ADMIN" ? <Shield className="h-5 w-5 text-purple-500" /> : <User className="h-5 w-5 text-blue-500" />}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{u.nombre}</p>
                    <p className="text-xs text-slate-500">{u.email} · {u.rol}</p>
                  </div>
                </div>
                <button onClick={() => toggleActivo(u.id, u.activo)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${u.activo ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}>
                  {u.activo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {u.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
