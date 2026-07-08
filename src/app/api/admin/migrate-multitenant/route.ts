import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/apiAuth"
import { createClient } from "@libsql/client"

export const maxDuration = 60

/**
 * Migración Fase 1 (multi-tenant, esquema compartido) — ADITIVA y no destructiva.
 * Crea las tablas Organizacion y Membership y agrega las columnas nullable
 * unidadEducativaId a Estudiante y Evaluacion. No modifica ni borra datos existentes.
 *
 * Solo admin autenticado (POST). Ejecutar UNA vez antes de desplegar el schema
 * de Prisma que referencia estas tablas/columnas.
 */
const STATEMENTS: { label: string; sql: string }[] = [
  {
    label: "Tabla Organizacion",
    sql: `CREATE TABLE IF NOT EXISTS Organizacion (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      parentId TEXT,
      path TEXT NOT NULL DEFAULT '',
      codigoSie TEXT,
      activo INTEGER NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  { label: "Índice Organizacion.parentId", sql: `CREATE INDEX IF NOT EXISTS Organizacion_parentId_idx ON Organizacion(parentId)` },
  { label: "Índice Organizacion.tipo", sql: `CREATE INDEX IF NOT EXISTS Organizacion_tipo_idx ON Organizacion(tipo)` },
  { label: "Índice Organizacion.path", sql: `CREATE INDEX IF NOT EXISTS Organizacion_path_idx ON Organizacion(path)` },
  {
    label: "Tabla Membership",
    sql: `CREATE TABLE IF NOT EXISTS Membership (
      id TEXT PRIMARY KEY NOT NULL,
      usuarioId TEXT NOT NULL,
      organizacionId TEXT NOT NULL,
      rol TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  },
  { label: "Índice único Membership(usuarioId,organizacionId)", sql: `CREATE UNIQUE INDEX IF NOT EXISTS Membership_usuarioId_organizacionId_key ON Membership(usuarioId, organizacionId)` },
  { label: "Índice Membership.usuarioId", sql: `CREATE INDEX IF NOT EXISTS Membership_usuarioId_idx ON Membership(usuarioId)` },
  { label: "Índice Membership.organizacionId", sql: `CREATE INDEX IF NOT EXISTS Membership_organizacionId_idx ON Membership(organizacionId)` },
  // ALTER TABLE ADD COLUMN no soporta IF NOT EXISTS en SQLite → se ejecuta en try/catch.
  { label: "Columna Estudiante.unidadEducativaId", sql: `ALTER TABLE Estudiante ADD COLUMN unidadEducativaId TEXT` },
  { label: "Columna Evaluacion.unidadEducativaId", sql: `ALTER TABLE Evaluacion ADD COLUMN unidadEducativaId TEXT` },
  { label: "Índice Estudiante.unidadEducativaId", sql: `CREATE INDEX IF NOT EXISTS Estudiante_unidadEducativaId_idx ON Estudiante(unidadEducativaId)` },
  { label: "Índice Evaluacion.unidadEducativaId", sql: `CREATE INDEX IF NOT EXISTS Evaluacion_unidadEducativaId_idx ON Evaluacion(unidadEducativaId)` },
]

async function run() {
  const url = process.env.TURSO_DATABASE_URL?.trim()
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim()
  if (!url) throw new Error("TURSO_DATABASE_URL no configurada")

  const client = createClient({ url, authToken })
  const log: string[] = []

  for (const stmt of STATEMENTS) {
    try {
      await client.execute(stmt.sql)
      log.push(`✓ ${stmt.label}`)
    } catch (e) {
      const msg = (e as Error).message
      // "duplicate column name" es esperado si la migración ya corrió: no es error.
      if (/duplicate column name/i.test(msg)) {
        log.push(`• ${stmt.label} (ya existía)`)
      } else {
        log.push(`✗ ${stmt.label}: ${msg}`)
      }
    }
  }
  return log
}

export async function POST() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  try {
    const log = await run()
    return NextResponse.json({ ok: true, log })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
