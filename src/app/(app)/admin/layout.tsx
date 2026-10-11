import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string })?.role !== "ADMIN") redirect("/dashboard")
  return <div className="p-4 lg:p-8 space-y-6">{children}</div>
}
