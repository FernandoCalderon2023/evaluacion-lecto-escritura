import { ReportTrace } from "@/components/resultados/ReportTrace"
import { PrintButton } from "@/components/resultados/PrintButton"
import { TrialResult } from "@/components/resultados/TrialResult"
import { calcularScores } from "@/lib/scoring"
import { readGuardedReport, guardReport } from "@/lib/ai/reportGuard"
import { isTrial } from "@/lib/commercial"
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getAuthContext, canViewInScope, canAccessResource } from "@/lib/apiAuth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { InformePadres } from "@/components/resultados/InformePadres"

export default async function InformePadresPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await getAuthContext()
  if (!auth) redirect("/login")

  const ev = await prisma.evaluacion.findUnique({
    where: { id: params.id },
    include: { estudiante: true },
  })
  if (!ev) notFound()
  if (!(await canViewInScope(auth, { docenteId: ev.docenteId, unidadEducativaId: ev.estudiante?.unidadEducativaId ?? null }))) {
    notFound()
  }

  if (await isTrial(auth.userId)) return <TrialResult id={ev.id} codigo={ev.estudiante.codigo} scores={calcularScores(ev as any)} canEdit={canAccessResource(auth, ev.docenteId)} familyView/>
  const scores = calcularScores(ev as any)
  const analisis = readGuardedReport(ev.analisisIA, scores) ?? guardReport({ recomendaciones: { paraElAula: [], paraLaFamilia: [] } }, scores)

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href={`/evaluaciones/${ev.id}`} className="text-slate-500 hover:text-slate-700 mt-1">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs uppercase tracking-wide text-viria-600 font-semibold">Informe para la familia</p>
          <h1 className="text-2xl font-bold text-slate-900">Para papás y mamás</h1>
          <p className="text-slate-500 text-sm mt-1">
            {ev.estudiante.grado} · {new Date(ev.fecha).toLocaleDateString("es-BO")}
          </p>
        </div>
      </div>

      <div className="print:hidden"><PrintButton/></div>
      <ReportTrace record={ev} scores={scores} compact/>
      <InformePadres analisis={analisis} sexo={ev.estudiante.sexo} />
    </div>
  )
}
