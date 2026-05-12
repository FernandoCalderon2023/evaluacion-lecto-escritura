import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { put, list, del } from "@vercel/blob"
import * as Sentry from "@sentry/nextjs"

export const maxDuration = 300

/**
 * Cron job: backup diario de la DB a Vercel Blob.
 *
 * Configurar en vercel.json:
 *   { "crons": [{ "path": "/api/cron/backup", "schedule": "0 3 * * *" }] }
 *
 * Vercel invoca este endpoint con header `Authorization: Bearer <CRON_SECRET>`.
 * Si CRON_SECRET no está configurado, también acepta token vía query (?token=...)
 * para invocación manual de prueba.
 */
async function isAuthorized(req: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET?.trim()
  const auth = req.headers.get("authorization")

  // Vercel Cron envía Authorization: Bearer <CRON_SECRET>
  if (cronSecret && auth === `Bearer ${cronSecret}`) return true

  // Fallback: token por query string (para invocación manual)
  const queryToken = new URL(req.url).searchParams.get("token")?.trim()
  const fallback = (process.env.NEXTAUTH_SECRET ?? "").trim()
  if (queryToken && fallback && queryToken === fallback) return true

  return false
}

async function runBackup() {
  const startedAt = Date.now()

  // Exportar todas las tablas
  const [usuarios, estudiantes, evaluaciones, analysisJobs] = await Promise.all([
    prisma.usuario.findMany(),
    prisma.estudiante.findMany(),
    prisma.evaluacion.findMany(),
    prisma.analysisJob.findMany(),
  ])

  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    counts: {
      usuarios: usuarios.length,
      estudiantes: estudiantes.length,
      evaluaciones: evaluaciones.length,
      analysisJobs: analysisJobs.length,
    },
    usuarios: usuarios.map((u) => ({ ...u, passwordHash: "***REDACTED***" })),
    estudiantes,
    evaluaciones,
    analysisJobs,
  }

  const json = JSON.stringify(data, null, 0)
  const sizeMB = (json.length / 1024 / 1024).toFixed(2)

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const filename = `backups/sideda-${today}.json`

  // Subir a Vercel Blob (sobreescribe si ya existe el del día)
  const blob = await put(filename, json, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  })

  // Limpiar backups viejos (>14 días)
  const { blobs } = await list({ prefix: "backups/", limit: 100 })
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000
  let deleted = 0
  for (const b of blobs) {
    if (new Date(b.uploadedAt).getTime() < cutoff) {
      await del(b.url).catch(() => {})
      deleted++
    }
  }

  const durationMs = Date.now() - startedAt
  return {
    ok: true,
    file: filename,
    url: blob.url,
    sizeMB,
    counts: data.counts,
    deletedOldBackups: deleted,
    durationMs,
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const result = await runBackup()
    console.log("[backup]", JSON.stringify(result))
    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[backup] Error:", msg)
    Sentry.captureException(err, { tags: { cron: "backup" } })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}

// También permitir POST por Vercel Cron (algunas versiones)
export const POST = GET
