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

  const family = (session!.user as any).role === "FAMILIA"
  const access = await trialAccess((session!.user as any).id)
  return (
    <AuthProvider session={session}><ActivityHeartbeat/>
      <MainLayout>{access?.estado === "PRUEBA" && <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-viria-200 bg-viria-50 px-5 py-3 text-sm text-viria-900"><span><strong>Prueba gratuita</strong> · {family ? `${access.evaluacionesUsadas}/1 registro familiar` : `${access.estudiantesUsados}/1 estudiante · ${access.evaluacionesUsadas}/1 evaluación`} · Resumen incluido</span><Link href="/suscripcion" className="font-semibold underline underline-offset-4">{access.solicitadoEn ? "Ver mi solicitud" : "Conocer la suscripción"}</Link></div>}{children}</MainLayout>
    </AuthProvider>
  )
}
