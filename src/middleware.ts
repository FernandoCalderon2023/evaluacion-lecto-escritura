import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
export default withAuth(function middleware(req) {
 const path = req.nextUrl.pathname
 if (req.nextauth.token?.role === "FAMILIA") {
  const allowed = ["/prueba", "/familia", "/cuenta", "/suscripcion", "/api/familia", "/api/cuenta", "/api/suscripcion"].some(p => path === p || path.startsWith(p + "/"))
  if (!allowed) return path.startsWith("/api/") ? NextResponse.json({ error: "Tu cuenta corresponde al espacio para familias." }, { status: 403 }) : NextResponse.redirect(new URL("/familia", req.url))
 }
}, { pages: { signIn: "/login" }, callbacks: { authorized: ({ token, req }) => req.nextUrl.pathname.startsWith("/api/") || (!!token && !token.invalid) } })
export const config = { matcher: ["/institucion/:path*", "/api/institucion/:path*", "/prueba/:path*", "/dashboard/:path*", "/estudiantes/:path*", "/evaluaciones/:path*", "/admin/:path*", "/guia/:path*", "/suscripcion/:path*", "/cuenta/:path*", "/familia/:path*", "/api/estudiantes/:path*", "/api/evaluaciones/:path*", "/api/dashboard/:path*", "/api/organizaciones/:path*", "/api/admin/:path*"] }
