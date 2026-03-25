import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

const ESTADO_CONFIG = {
  "sin-dificultades":    { label: "Sin Dificultades",    color: "bg-green-100 text-green-800" },
  "dificultad-leve":     { label: "Dificultad Leve",     color: "bg-yellow-100 text-yellow-800" },
  "dificultad-moderada": { label: "Dificultad Moderada", color: "bg-orange-100 text-orange-800" },
  "dificultad-severa":   { label: "Dificultad Severa",   color: "bg-red-100 text-red-800" },
}

export default async function EvaluacionesPage({ searchParams }: { searchParams: { estado?: string } }) {
  const filtroEstado = searchParams.estado

  const evaluaciones = await prisma.evaluacion.findMany({
    where: filtroEstado ? { estadoAprendizaje: filtroEstado } : undefined,
    orderBy: { fecha: "desc" },
    include: {
      estudiante: { select: { nombre: true, apellido1: true, apellido2: true, grado: true, unidadEducativa: true } },
    },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Evaluaciones</h1>
          <p className="text-slate-500 text-sm mt-1">{evaluaciones.length} evaluación(es)</p>
        </div>
        <Link
          href="/evaluaciones/nueva"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva evaluación
        </Link>
      </div>

      {/* Filtros por estado */}
      <div className="flex gap-2 flex-wrap">
        <Link
          href="/evaluaciones"
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${!filtroEstado ? "bg-slate-800 text-white border-slate-800" : "border-slate-300 text-slate-600 hover:border-slate-500"}`}
        >
          Todos
        </Link>
        {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
          <Link
            key={key}
            href={`/evaluaciones?estado=${key}`}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${filtroEstado === key ? cfg.color + " border-current" : "border-slate-300 text-slate-600 hover:border-slate-500"}`}
          >
            {cfg.label}
          </Link>
        ))}
      </div>

      {evaluaciones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-400">
            No hay evaluaciones registradas.{" "}
            <Link href="/evaluaciones/nueva" className="text-blue-600 hover:underline">Crear la primera</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {evaluaciones.map((ev) => {
            const cfg = ESTADO_CONFIG[ev.estadoAprendizaje as keyof typeof ESTADO_CONFIG]
            const est = ev.estudiante
            return (
              <Link key={ev.id} href={`/evaluaciones/${ev.id}`}>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex gap-4 items-center">
                    <div>
                      <p className="font-medium text-slate-900">
                        {est.apellido1} {est.apellido2} {est.nombre}
                      </p>
                      <p className="text-xs text-slate-500">
                        {est.grado} · {est.unidadEducativa} · Evaluador: {ev.evaluador}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-slate-400">{new Date(ev.fecha).toLocaleDateString("es-BO")}</p>
                    {cfg && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    )}
                    {ev.analisisIA && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">✨ IA</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
