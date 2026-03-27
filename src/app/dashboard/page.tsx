export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, ClipboardList, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

const ESTADO_CONFIG = {
  "sin-dificultades":    { label: "Sin Dificultades",    color: "bg-green-100 text-green-800" },
  "dificultad-leve":     { label: "Dificultad Leve",     color: "bg-yellow-100 text-yellow-800" },
  "dificultad-moderada": { label: "Dificultad Moderada", color: "bg-orange-100 text-orange-800" },
  "dificultad-severa":   { label: "Dificultad Severa",   color: "bg-red-100 text-red-800" },
}

export default async function DashboardPage() {
  const [totalEst, totalEv, porEstado, recientes] = await Promise.all([
    prisma.estudiante.count(),
    prisma.evaluacion.count(),
    prisma.evaluacion.groupBy({ by: ["estadoAprendizaje"], _count: { _all: true } }),
    prisma.evaluacion.findMany({
      take: 6,
      orderBy: { fecha: "desc" },
      include: { estudiante: { select: { nombre: true, apellido1: true, grado: true } } },
    }),
  ])

  const estadoMap: Record<string, number> = {}
  for (const r of porEstado) estadoMap[r.estadoAprendizaje ?? "sin-evaluar"] = r._count._all

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel Principal</h1>
        <p className="text-slate-500 text-sm mt-1">
          Instrumento de Evaluación de Dificultades en Lecto-Escritura — Ministerio de Educación Bolivia
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <Users className="h-4 w-4" /> Total Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalEst}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Total Evaluaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalEv}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" /> Sin Dificultades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {estadoMap["sin-dificultades"] ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Con Dificultad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {(estadoMap["dificultad-leve"] ?? 0) +
               (estadoMap["dificultad-moderada"] ?? 0) +
               (estadoMap["dificultad-severa"] ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por estado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribución por Estado de Aprendizaje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
              <div key={key} className={`rounded-lg p-4 ${cfg.color}`}>
                <p className="text-2xl font-bold">{estadoMap[key] ?? 0}</p>
                <p className="text-xs mt-1">{cfg.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evaluaciones recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Evaluaciones Recientes</CardTitle>
          <Link href="/evaluaciones/nueva" className="text-sm text-blue-600 hover:underline">
            + Nueva evaluación
          </Link>
        </CardHeader>
        <CardContent>
          {recientes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No hay evaluaciones aún.{" "}
              <Link href="/evaluaciones/nueva" className="text-blue-600 hover:underline">
                Crear la primera
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {recientes.map((ev) => {
                const cfg = ESTADO_CONFIG[ev.estadoAprendizaje as keyof typeof ESTADO_CONFIG]
                return (
                  <Link key={ev.id} href={`/evaluaciones/${ev.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {ev.estudiante.nombre} {ev.estudiante.apellido1}
                        </p>
                        <p className="text-xs text-slate-500">
                          {ev.estudiante.grado} · {new Date(ev.fecha).toLocaleDateString("es-BO")}
                        </p>
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
  )
}
