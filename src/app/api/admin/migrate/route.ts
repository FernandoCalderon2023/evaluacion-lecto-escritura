import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@libsql/client"

export const maxDuration = 60

function generarCodigo(nombre: string, apellido1: string, apellido2: string | null, rude?: string | null): string {
  const limpiar = (s: string) => s.trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase()
  const initials = [
    limpiar(apellido1)[0] ?? "X",
    apellido2 ? (limpiar(apellido2)[0] ?? "") : "",
    limpiar(nombre)[0] ?? "X",
  ].filter(Boolean).join("")
  let sufijo: string
  if (rude && rude.trim().length > 0) {
    const clean = rude.replace(/[^A-Z0-9]/gi, "").toUpperCase()
    sufijo = clean.slice(-4).padStart(4, "0")
  } else {
    sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
  }
  return `${initials}-${sufijo}`
}

async function runMigration() {
  const url = process.env.TURSO_DATABASE_URL?.trim()
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim()
  if (!url) throw new Error("TURSO_DATABASE_URL no configurada")

  const client = createClient({ url, authToken })
  const log: string[] = []

  const cols = await client.execute("PRAGMA table_info(Estudiante)")
  const hasCodigo = cols.rows.some((r: any) => r.name === "codigo")

  if (!hasCodigo) {
    await client.execute('ALTER TABLE Estudiante ADD COLUMN codigo TEXT')
    log.push("✓ Columna 'codigo' agregada")
  } else {
    log.push("• Columna 'codigo' ya existe")
  }

  const sin = await client.execute("SELECT id, nombre, apellido1, apellido2, codigoRude FROM Estudiante WHERE codigo IS NULL OR codigo = ''")
  log.push(`Estudiantes sin código: ${sin.rows.length}`)

  for (const row of sin.rows) {
    const r = row as any
    let codigo = generarCodigo(r.nombre, r.apellido1, r.apellido2, r.codigoRude)
    for (let i = 0; i < 5; i++) {
      const ex = await client.execute({ sql: 'SELECT id FROM Estudiante WHERE codigo = ?', args: [codigo] })
      if (ex.rows.length === 0) break
      codigo = `${codigo}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
    }
    await client.execute({ sql: 'UPDATE Estudiante SET codigo = ? WHERE id = ?', args: [codigo, r.id] })
    log.push(`  ${r.id} → ${codigo}`)
  }

  try {
    await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS Estudiante_codigo_key ON Estudiante(codigo)')
    log.push("✓ Índice único creado")
  } catch (e) {
    log.push(`Índice: ${(e as Error).message}`)
  }

  return log
}

// GET sin auth: para arrancar la migración cuando el sistema está roto
// Visita /api/admin/migrate?token=NEXTAUTH_SECRET en el navegador
export async function GET(req: NextRequest) {
  const token = (new URL(req.url).searchParams.get("token") || "").trim()
  const expected = (process.env.NEXTAUTH_SECRET || "").trim()
  if (token !== expected) {
    return NextResponse.json({ error: "Token inválido" }, { status: 403 })
  }
  try {
    const log = await runMigration()
    return NextResponse.json({ ok: true, log })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST con auth admin: para ejecutar desde el panel
export async function POST() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  try {
    const log = await runMigration()
    return NextResponse.json({ ok: true, log })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
