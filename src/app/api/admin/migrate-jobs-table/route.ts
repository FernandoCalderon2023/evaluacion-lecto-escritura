import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@libsql/client"

export const maxDuration = 30

const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS AnalysisJob (
  id TEXT PRIMARY KEY NOT NULL,
  evaluacionId TEXT NOT NULL,
  docenteId TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  error TEXT,
  startedAt DATETIME,
  completedAt DATETIME,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
)
`

const INDEXES = [
  `CREATE INDEX IF NOT EXISTS AnalysisJob_evaluacionId_idx ON AnalysisJob(evaluacionId)`,
  `CREATE INDEX IF NOT EXISTS AnalysisJob_status_idx ON AnalysisJob(status)`,
  `CREATE INDEX IF NOT EXISTS AnalysisJob_createdAt_idx ON AnalysisJob(createdAt)`,
]

async function runMigration() {
  const url = process.env.TURSO_DATABASE_URL?.trim()
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim()
  if (!url) throw new Error("TURSO_DATABASE_URL no configurada")
  const client = createClient({ url, authToken })
  const log: string[] = []

  try {
    await client.execute(CREATE_TABLE)
    log.push("✓ Tabla AnalysisJob creada")
  } catch (e) {
    log.push(`Tabla: ${(e as Error).message}`)
  }

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
