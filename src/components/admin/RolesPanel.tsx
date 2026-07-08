"use client"
import { useState, useEffect } from "react"
import { Database, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Org { id: string; nombre: string; tipo: string; parentId: string | null }
interface Membresia { id: string; usuarioId: string; organizacionId: string; rol: string }
interface UsuarioMin { id: string; nombre: string; email: string }

const TIPO_LABEL: Record<string, string> = {
  DEPARTAMENTO: "Departamento",
  DISTRITO: "Distrito",
  UNIDAD_EDUCATIVA: "Unidad Educativa",
  RED: "Red",
}
const ROL_LABEL: Record<string, string> = {
  DOCENTE: "Docente",
  DIRECTOR: "Director/a",
  DISTRITAL: "Distrital",
  DEPARTAMENTAL: "Departamental",
}

const inputCls =
  "w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500"

export function RolesPanel({ usuarios }: { usuarios: UsuarioMin[] }) {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [membs, setMembs] = useState<Membresia[]>([])
  const [loading, setLoading] = useState(false)

  async function cargar() {
    const [o, m] = await Promise.all([
      fetch("/api/admin/organizaciones").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/admin/membresias").then((r) => (r.ok ? r.json() : [])),
    ])
    setOrgs(Array.isArray(o) ? o : [])
    setMembs(Array.isArray(m) ? m : [])
  }
  useEffect(() => {
    cargar()
  }, [])

  // Crear organización
  const [orgNombre, setOrgNombre] = useState("")
  const [orgTipo, setOrgTipo] = useState("UNIDAD_EDUCATIVA")
  const [orgParent, setOrgParent] = useState("")
  async function crearOrg(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin/organizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: orgNombre, tipo: orgTipo, parentId: orgParent || null }),
      })
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || "Error al crear la organización")
        return
      }
      setOrgNombre("")
      setOrgParent("")
      await cargar()
    } finally {
      setLoading(false)
    }
  }

  // Asignar rol
  const [mUser, setMUser] = useState("")
  const [mOrg, setMOrg] = useState("")
  const [mRol, setMRol] = useState("DIRECTOR")
  async function asignar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/admin/membresias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: mUser, organizacionId: mOrg, rol: mRol }),
      })
      if (!res.ok) {
        const d = await res.json()
        alert(d.error || "Error al asignar el rol")
        return
      }
      await cargar()
    } finally {
      setLoading(false)
    }
  }
  async function quitar(id: string) {
    if (!confirm("¿Quitar este rol?")) return
    await fetch(`/api/admin/membresias?id=${id}`, { method: "DELETE" })
    await cargar()
  }

  const nombreUser = (id: string) => usuarios.find((u) => u.id === id)?.nombre ?? id.slice(0, 8)
  const nombreOrg = (id: string) => orgs.find((o) => o.id === id)?.nombre ?? id.slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" /> Nueva organización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={crearOrg} className="space-y-3">
              <input value={orgNombre} onChange={(e) => setOrgNombre(e.target.value)} placeholder="Nombre (ej: Distrito 3, U.E. Simón Bolívar)" required className={inputCls} />
              <select value={orgTipo} onChange={(e) => setOrgTipo(e.target.value)} className={inputCls}>
                {Object.entries(TIPO_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <select value={orgParent} onChange={(e) => setOrgParent(e.target.value)} className={inputCls}>
                <option value="">— Sin superior (raíz) —</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>{TIPO_LABEL[o.tipo] ?? o.tipo}: {o.nombre}</option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="bg-viria-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-viria-700 disabled:opacity-50">
                {loading ? "Guardando..." : "Crear organización"}
              </button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Asignar rol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={asignar} className="space-y-3">
              <select value={mUser} onChange={(e) => setMUser(e.target.value)} required className={inputCls}>
                <option value="">— Usuario —</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
                ))}
              </select>
              <select value={mOrg} onChange={(e) => setMOrg(e.target.value)} required className={inputCls}>
                <option value="">— Organización —</option>
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>{TIPO_LABEL[o.tipo] ?? o.tipo}: {o.nombre}</option>
                ))}
              </select>
              <select value={mRol} onChange={(e) => setMRol(e.target.value)} className={inputCls}>
                {Object.entries(ROL_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {loading ? "Asignando..." : "Asignar rol"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Roles asignados ({membs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {membs.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aún no hay roles asignados. Asigná un <strong>Director/a</strong> a su Unidad Educativa para que vea a todos los estudiantes de su colegio.
            </p>
          ) : (
            <div className="space-y-2">
              {membs.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border-2 border-slate-200 bg-white">
                  <div className="text-sm">
                    <span className="font-semibold text-slate-900">{nombreUser(m.usuarioId)}</span>
                    <span className="text-slate-500"> — {ROL_LABEL[m.rol] ?? m.rol} de </span>
                    <span className="font-medium text-slate-700">{nombreOrg(m.organizacionId)}</span>
                  </div>
                  <button onClick={() => quitar(m.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50">
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
