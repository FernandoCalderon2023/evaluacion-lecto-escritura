import { institutionFor } from "@/lib/institution"
import { getWorkspaceProfile } from "@/lib/getWorkspaceProfile"
import { ActivityHeartbeat } from "@/components/auth/ActivityHeartbeat"
import Link from "next/link"
import { trialAccess } from "@/lib/commercial"
import { MainLayout } from "@/components/layout/MainLayout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthProvider } from "@/components/auth/AuthProvider"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) redirect("/login")

  const profile = await getWorkspaceProfile((session!.user as any).id, (session!.user as any).role)
  const family = (session!.user as any).role === "FAMILIA"
  const institution = await institutionFor((session!.user as any).id)
  const access = await trialAccess((session!.user as any).id)
  return (
    <AuthProvider session={session}><ActivityHeartbeat/>
      <MainLayout profile={profile}>{institution && <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b bg-viria-50 px-5 py-3 text-sm"><span><strong>{institution.institucion.nombre}</strong> · {institution.institucion.limiteEvaluaciones - institution.institucion.evaluacionesUsadas} de {institution.institucion.limiteEvaluaciones} evaluaciones disponibles para el equipo</span><Link href="/institucion" className="font-semibold underline">{institution.gestor ? "Administrar equipo y cupo →" : "Ver mi paquete →"}</Link></div>}{access?.estado === "PRUEBA" && <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-viria-200 bg-viria-50 px-5 py-3 text-sm text-viria-900"><span><strong>Prueba gratuita</strong> · {family ? `${access.evaluacionesUsadas}/1 registro familiar` : `${access.estudiantesUsados}/1 estudiante · ${access.evaluacionesUsadas}/1 evaluación`} · Resultado e impresión incluidos</span><Link href="/prueba" className="font-semibold underline underline-offset-4">Mi recorrido gratuito →</Link></div>}{children}</MainLayout>
    </AuthProvider>
  )
}
