export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getAuthContext, canAccessResource } from "@/lib/apiAuth"
import { notFound, redirect } from "next/navigation"
import { EvaluacionWizard } from "@/components/evaluacion/EvaluacionWizard"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default async function EditarEvaluacionPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await getAuthContext()
  if (!auth) redirect("/login")
  const ev = await prisma.evaluacion.findUnique({
    where: { id: params.id },
    include: { estudiante: true },
  })
  if (!ev || !canAccessResource(auth, ev.docenteId)) notFound()

  const estudiantes = [{ id: ev.estudiante.id, codigo: ev.estudiante.codigo, grado: ev.estudiante.grado }]

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
    <div className="p-4 lg:p-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/evaluaciones/${params.id}`} className="text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Evaluación</h1>
          <p className="text-sm text-slate-500">
            <span className="font-mono">{ev.estudiante.codigo ?? "—"}</span> — {new Date(ev.fecha).toLocaleDateString("es-BO")}
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="p-3 sm:p-6">
          <EvaluacionWizard
            draftOwner={auth.userId}
            sourceRevision={ev.updatedAt.toISOString()}
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
