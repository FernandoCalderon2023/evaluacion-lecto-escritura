import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { requireAdmin } from "@/lib/apiAuth"
import { createClient } from "@libsql/client"

export const maxDuration = 60

const INDEXES = [
  // Estudiante
  `CREATE INDEX IF NOT EXISTS Estudiante_docenteId_idx ON Estudiante(docenteId)`,
  `CREATE INDEX IF NOT EXISTS Estudiante_createdAt_idx ON Estudiante(createdAt)`,
  // Evaluacion
  `CREATE INDEX IF NOT EXISTS Evaluacion_docenteId_idx ON Evaluacion(docenteId)`,
  `CREATE INDEX IF NOT EXISTS Evaluacion_estudianteId_idx ON Evaluacion(estudianteId)`,
  `CREATE INDEX IF NOT EXISTS Evaluacion_fecha_idx ON Evaluacion(fecha)`,
  `CREATE INDEX IF NOT EXISTS Evaluacion_estadoAprendizaje_idx ON Evaluacion(estadoAprendizaje)`,
]

async function runMigration() {
  const url = process.env.TURSO_DATABASE_URL?.trim()
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim()
  if (!url) throw new Error("TURSO_DATABASE_URL no configurada")
  const client = createClient({ url, authToken })
  const log: string[] = []

  for (const sql of INDEXES) {
    try {
      await client.execute(sql)
      log.push(`✓ ${sql.slice(0, 60)}...`)
    } catch (e) {
      log.push(`✗ ${(e as Error).message}`)
    }
  }
  return log
}

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

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  try {
    const log = await runMigration()
    return NextResponse.json({ ok: true, log })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
