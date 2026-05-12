"use client"
import { SessionProvider, useSession } from "next-auth/react"
import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

function SentryUserContext() {
  const { data: session } = useSession()
  useEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: (session.user as any).id,
        email: session.user.email ?? undefined,
        username: session.user.name ?? undefined,
        rol: (session.user as any).role,
      } as any)
    } else {
      Sentry.setUser(null)
    }
  }, [session])
  return null
}

export function AuthProvider({ children, session }: { children: React.ReactNode; session: any }) {
  return (
    <SessionProvider session={session}>
      <SentryUserContext />
      {children}
    </SessionProvider>
  )
}
