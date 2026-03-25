import { prisma } from "@/lib/prisma"
import { EvaluacionWizard } from "@/components/evaluacion/EvaluacionWizard"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default async function NuevaEvaluacionPage({
  searchParams,
}: {
  searchParams: { estudianteId?: string }
}) {
  const estudiantes = await prisma.estudiante.findMany({
    orderBy: { apellido1: "asc" },
    select: { id: true, nombre: true, apellido1: true, grado: true },
  })

  if (estudiantes.length === 0) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/evaluaciones" className="text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Nueva Evaluación</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <p>Primero debes registrar al menos un estudiante.</p>
            <Link href="/estudiantes/nuevo" className="text-blue-600 hover:underline mt-2 inline-block">
              Registrar estudiante
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/evaluaciones" className="text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nueva Evaluación</h1>
      </div>
      <Card>
        <CardContent className="p-6">
          <EvaluacionWizard
            estudianteId={searchParams.estudianteId}
            estudiantes={estudiantes}
          />
        </CardContent>
      </Card>
    </div>
  )
}
