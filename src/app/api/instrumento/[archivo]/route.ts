import { NextRequest, NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { getAuthContext } from "@/lib/apiAuth"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export async function GET(req: NextRequest, { params }: { params: Promise<{ archivo: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 })
  if (!["ADMIN", "DOCENTE", "DIRECTOR", "DISTRITAL", "DEPARTAMENTAL"].includes(auth.role)) return NextResponse.json({ error: "Material de aplicación profesional." }, { status: 403 })
  const { archivo } = await params
  if (archivo !== "original.pdf" && !/^pagina-(0[1-9]|1[0-3])\.jpg$/.test(archivo)) return NextResponse.json({ error: "Archivo no encontrado." }, { status: 404 })
  try {
    const data = await readFile(path.join(process.cwd(), "assets", "instrumento", archivo))
    return new NextResponse(data, { headers: {
      "Content-Type": archivo.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
      "Content-Disposition": `${req.nextUrl.searchParams.get("descargar") === "1" ? "attachment" : "inline"}; filename="${archivo === "original.pdf" ? "SIDEDA-Instrumento-Lectoescritura-MINEDU-2012.pdf" : archivo}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } })
  } catch { return NextResponse.json({ error: "No se pudo abrir el instrumento. Intenta nuevamente." }, { status: 503 }) }
}
