import { NextResponse } from "next/server"
import { getAuthContext } from "@/lib/apiAuth"
export const dynamic = "force-dynamic"
// Legacy URLs deliberately stop serving the uploaded PDF and its raster pages.
export async function GET() {
 const auth = await getAuthContext()
 if (!auth) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 })
 if (!["ADMIN", "DOCENTE", "DIRECTOR", "DISTRITAL", "DEPARTAMENTAL"].includes(auth.role)) return NextResponse.json({ error: "Material de aplicación profesional." }, { status: 403 })
 return NextResponse.json({ error: "El archivo original fue retirado. Utiliza la plantilla SIDEDA.", href: "/evaluaciones/instrumento" }, { status: 410, headers: { "Cache-Control": "private, no-store" } })
}
