export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EvaluacionWizard } from "@/components/evaluacion/EvaluacionWizard"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default async function EditarEvaluacionPage({ params }: { params: { id: string } }) {
  const ev = await prisma.evaluacion.findUnique({
    where: { id: params.id },
    include: { estudiante: true },
  })
  if (!ev) notFound()

  const estudiantes = await prisma.estudiante.findMany({
    orderBy: { apellido1: "asc" },
    select: { id: true, nombre: true, apellido1: true, grado: true },
  })

  // Convert DB record to form data (strip computed fields)
  const {
    id, estudiante, createdAt, updatedAt,
    scoreCognitivo, scoreLexical, scoreComprension,
    estadoAprendizaje, analisisIA, analisisGeneradoEn,
    bpmScoreTonicidad, bpmScoreEquilibrio, bpmScoreLateralidad,
    bpmScoreNocionCuerpo, bpmScoreEstructuracionET,
    bpmScorePraxiaGlobal, bpmScorePraxiaFina, bpmPerfilGeneral,
    ...formData
  } = ev as any

  // Convert fecha to date string for the input
  const initialData = {
    ...formData,
    fecha: new Date(ev.fecha).toISOString().split("T")[0],
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/evaluaciones/${params.id}`} className="text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Evaluación</h1>
          <p className="text-sm text-slate-500">
            {ev.estudiante.apellido1} {ev.estudiante.nombre} — {new Date(ev.fecha).toLocaleDateString("es-BO")}
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <EvaluacionWizard
            estudianteId={ev.estudianteId}
            estudiantes={estudiantes}
            editMode={params.id}
            initialData={initialData}
          />
        </CardContent>
      </Card>
    </div>
  )
}
