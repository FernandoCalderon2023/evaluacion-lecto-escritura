import { MainLayout } from "@/components/layout/MainLayout"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AuthProvider } from "@/components/auth/AuthProvider"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  return (
    <AuthProvider session={session}>
      <MainLayout>{children}</MainLayout>
    </AuthProvider>
  )
}
