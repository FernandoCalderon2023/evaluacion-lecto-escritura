export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft } from "lucide-react"
import { DeleteButton } from "@/components/shared/DeleteButton"

const ESTADO_CONFIG = {
  "sin-dificultades":    { label: "Sin Dificultades",    color: "bg-green-100 text-green-800" },
  "dificultad-leve":     { label: "Dificultad Leve",     color: "bg-yellow-100 text-yellow-800" },
  "dificultad-moderada": { label: "Dificultad Moderada", color: "bg-orange-100 text-orange-800" },
  "dificultad-severa":   { label: "Dificultad Severa",   color: "bg-red-100 text-red-800" },
}

export default async function EstudiantePerfilPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === "ADMIN"
  const docenteId = (session?.user as any)?.id

  const est = await prisma.estudiante.findUnique({
    where: { id: params.id },
    include: { evaluaciones: { orderBy: { fecha: "desc" } } },
  })
  if (!est) notFound()
  // Docente solo accede a sus propios estudiantes
  if (!isAdmin && est.docenteId !== docenteId) notFound()

  const edad = Math.floor(
    (Date.now() - new Date(est.fechaNac).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  )

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/estudiantes" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {est.apellido1} {est.apellido2} {est.nombre}
            </h1>
            <p className="text-slate-500 text-sm">{est.grado} · {est.unidadEducativa}</p>
          </div>
        </div>
        <DeleteButton
          endpoint={`/api/estudiantes/${est.id}`}
          redirectTo="/estudiantes"
          label="Eliminar estudiante"
          confirmMessage={`¿Eliminar a ${est.nombre} ${est.apellido1} y todas sus evaluaciones?`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos personales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-slate-500">Sexo:</span> {est.sexo === "M" ? "Masculino" : "Femenino"}</div>
              <div><span className="text-slate-500">Edad:</span> {edad} años</div>
              <div><span className="text-slate-500">Grado:</span> {est.grado}</div>
              <div><span className="text-slate-500">Gestión:</span> {est.gestion}</div>
              <div className="col-span-2"><span className="text-slate-500">Docente:</span> {est.docente}</div>
              {est.codigoRude && <div className="col-span-2"><span className="text-slate-500">RUDE:</span> {est.codigoRude}</div>}
              {est.domicilio && <div className="col-span-2"><span className="text-slate-500">Domicilio:</span> {est.domicilio}</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Historial de Evaluaciones</CardTitle>
            <Link
              href={`/evaluaciones/nueva?estudianteId=${est.id}`}
              className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-700"
            >
              <Plus className="h-3 w-3" />
              Nueva
            </Link>
          </CardHeader>
          <CardContent>
            {est.evaluaciones.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">Sin evaluaciones registradas</p>
            ) : (
              <div className="space-y-2">
                {est.evaluaciones.map((ev) => {
                  const cfg = ESTADO_CONFIG[ev.estadoAprendizaje as keyof typeof ESTADO_CONFIG]
                  return (
                    <Link key={ev.id} href={`/evaluaciones/${ev.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {new Date(ev.fecha).toLocaleDateString("es-BO")}
                          </p>
                          <p className="text-xs text-slate-500">{ev.evaluador}</p>
                        </div>
                        {cfg && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
