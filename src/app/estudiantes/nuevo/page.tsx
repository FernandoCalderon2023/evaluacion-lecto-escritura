"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function NuevoEstudiantePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const data = {
      nombre: form.get("nombre"),
      apellido1: form.get("apellido1"),
      apellido2: form.get("apellido2") || null,
      fechaNac: new Date(form.get("fechaNac") as string).toISOString(),
      grado: form.get("grado"),
      unidadEducativa: form.get("unidadEducativa"),
      gestion: Number(form.get("gestion")),
      docente: form.get("docente"),
      sexo: form.get("sexo"),
      codigoRude: form.get("codigoRude") || null,
      domicilio: form.get("domicilio") || null,
    }
    try {
      const res = await fetch("/api/estudiantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const est = await res.json()
      toast({ title: "Estudiante registrado correctamente" })
      router.push(`/estudiantes/${est.id}`)
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Nuevo Estudiante</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del estudiante</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="apellido1">1er Apellido *</Label>
                <Input id="apellido1" name="apellido1" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="apellido2">2do Apellido</Label>
                <Input id="apellido2" name="apellido2" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombres *</Label>
              <Input id="nombre" name="nombre" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fechaNac">Fecha de Nacimiento *</Label>
                <Input id="fechaNac" name="fechaNac" type="date" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sexo">Sexo *</Label>
                <select
                  id="sexo"
                  name="sexo"
                  required
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="grado">Grado / Curso *</Label>
                <Input id="grado" name="grado" placeholder="Ej: 3ro Primaria" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gestion">Gestión (año) *</Label>
                <Input id="gestion" name="gestion" type="number" defaultValue={new Date().getFullYear()} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="unidadEducativa">Unidad Educativa *</Label>
              <Input id="unidadEducativa" name="unidadEducativa" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="docente">Docente responsable *</Label>
              <Input id="docente" name="docente" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="codigoRude">Código RUDE</Label>
                <Input id="codigoRude" name="codigoRude" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="domicilio">Domicilio</Label>
                <Input id="domicilio" name="domicilio" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Registrar estudiante"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="border border-slate-300 px-6 py-2 rounded-lg text-sm hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
