import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { loginRateLimit, checkRateLimit } from "@/lib/ratelimit"
import { logAudit } from "@/lib/audit"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email.toLowerCase().trim()

        // Rate limit por email (previene brute force a una cuenta específica)
        // y por IP (previene brute force masivo desde un punto)
        const ip = (req?.headers as any)?.["x-forwarded-for"]?.toString().split(",")[0]?.trim()
          ?? (req?.headers as any)?.["x-real-ip"]
          ?? "unknown"

        const [emailRl, ipRl] = await Promise.all([
          checkRateLimit(loginRateLimit, `login:email:${email}`),
          checkRateLimit(loginRateLimit, `login:ip:${ip}`),
        ])

        if (!emailRl.allowed || !ipRl.allowed) {
          // Audit del intento bloqueado
          logAudit({
            actorEmail: email,
            action: "login_rate_limited",
            metadata: { reason: !emailRl.allowed ? "email" : "ip", ip },
          })
          throw new Error("Demasiados intentos. Intenta en unos minutos.")
        }

        const user = await prisma.usuario.findUnique({ where: { email } })
        if (!user) {
          logAudit({
            actorEmail: email,
            action: "login_failed_no_user",
            metadata: { ip },
          })
          return null
        }

        if (!user.activo) {
          logAudit({
            actorId: user.id,
            actorEmail: email,
            action: "login_failed_inactive",
            metadata: { ip },
          })
          throw new Error("Cuenta desactivada. Contacta al administrador.")
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) {
          logAudit({
            actorId: user.id,
            actorEmail: email,
            action: "login_failed_bad_password",
            metadata: { ip },
          })
          return null
        }

        // Login exitoso
        logAudit({
          actorId: user.id,
          actorEmail: email,
          action: "login_success",
          metadata: { ip },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.rol,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || "sideda-secret-key-change-in-production",
}
