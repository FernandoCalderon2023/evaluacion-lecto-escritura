export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, User } from "lucide-react"

export default async function EstudiantesPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = searchParams.q ?? ""
  const estudiantes = await prisma.estudiante.findMany({
    where: q
      ? { OR: [{ nombre: { contains: q } }, { apellido1: { contains: q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { evaluaciones: true } } },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estudiantes</h1>
          <p className="text-slate-500 text-sm mt-1">{estudiantes.length} registrado(s)</p>
        </div>
        <Link
          href="/estudiantes/nuevo"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo estudiante
        </Link>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o apellido..."
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700"
        >
          Buscar
        </button>
      </form>

      {estudiantes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-slate-400">
            {q ? "No se encontraron estudiantes con esa búsqueda." : "No hay estudiantes registrados aún."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estudiantes.map((est) => (
            <Link key={est.id} href={`/estudiantes/${est.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {est.apellido1} {est.apellido2} {est.nombre}
                      </p>
                      <p className="text-sm text-slate-500">{est.grado} · {est.unidadEducativa}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {est._count.evaluaciones} evaluación(es)
                        </Badge>
                        <span className="text-xs text-slate-400">{est.sexo === "M" ? "Masculino" : "Femenino"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
