import { createHmac } from "node:crypto"
import { prisma } from "@/lib/prisma"

function bounded(value: string | undefined, fallback: number, max: number) {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= max ? n : fallback
}
export function aiCapacity() {
  return {
    parallelism: bounded(process.env.AI_MAX_CONCURRENT, 3, 20),
    perUser: bounded(process.env.AI_MAX_CONCURRENT_PER_USER, 1, 3),
    hourlyPerUser: bounded(process.env.AI_MAX_PER_USER_HOUR, 20, 100),
    queueMode: process.env.AI_QUEUE_MODE?.trim().toLowerCase() === "qstash" ? "qstash" : "inline",
  }
}
export async function getAIControl() {
  const defaults = aiCapacity()
  const saved = await prisma.systemControl.findUnique({ where: { id: "ai" } })
  return { ...defaults, paused: saved?.paused ?? false, parallelism: saved?.parallelism ?? defaults.parallelism, perUser: saved?.perUser ?? defaults.perUser, hourlyPerUser: saved?.hourlyPerUser ?? defaults.hourlyPerUser, revision: saved?.revision ?? 0 }
}
export class AnalysisError extends Error {
  constructor(public code: string, message: string, public status = 503, public retryAfter = 15) { super(message) }
}
export class AnalysisBusyError extends AnalysisError {
  constructor(paused = false) { super(paused ? "AI_PAUSED" : "AI_BUSY", paused ? "La generación de informes está pausada temporalmente por administración. Tus evaluaciones siguen disponibles." : "Hay otros informes en proceso. Espera unos segundos y vuelve a intentar.", 429) }
}
export class AnalysisAlreadyRunning extends AnalysisError {
  constructor() { super("AI_RUNNING", "Este informe ya está en proceso.", 202) }
}
export function publicAnalysisError(error: unknown) {
  return error instanceof AnalysisError ? error : new AnalysisError("AI_UNAVAILABLE", "No se pudo generar el informe. Tus datos están guardados; vuelve a intentar más tarde.")
}

// Worker maximum is 300 seconds. Expiration is longer, so live workers are not evicted.
export async function expireAnalysisJobs(evaluacionId?: string) {
  const now = new Date()
  await prisma.analysisJob.updateMany({
    where: { ...(evaluacionId ? { evaluacionId } : {}), OR: [
      { status: "processing", updatedAt: { lt: new Date(now.getTime() - 6 * 60000) } },
      { status: "queued", createdAt: { lt: new Date(now.getTime() - 30 * 60000) } },
    ] },
    data: { status: "failed", activeKey: null, error: "El trabajo venció. Puedes solicitar un nuevo informe.", completedAt: now },
  })
}

// One SQLite/libSQL write, shared by every Vercel instance. A count followed by a
// separate update (or an in-memory semaphore) would allow concurrent oversubscription.
export async function claimAnalysisJob(jobId: string, evaluacionId: string) {
  await expireAnalysisJobs()
  const limits = await getAIControl()
  if (limits.paused) return 0
  const now = new Date()
  return prisma.$executeRaw`
    UPDATE "AnalysisJob" SET "status" = 'processing', "startedAt" = ${now}, "updatedAt" = ${now}
    WHERE "id" = ${jobId} AND "evaluacionId" = ${evaluacionId} AND "status" = 'queued'
      AND "activeKey" = ${evaluacionId}
      AND COALESCE((SELECT "paused" FROM "SystemControl" WHERE "id" = 'ai'), 0) = 0
      AND (SELECT COUNT(*) FROM "AnalysisJob" WHERE "status" = 'processing') < COALESCE((SELECT "parallelism" FROM "SystemControl" WHERE "id" = 'ai'), ${limits.parallelism})
      AND (SELECT COUNT(*) FROM "AnalysisJob" AS running
           WHERE running."status" = 'processing'
           AND COALESCE(running."docenteId", '') = COALESCE((SELECT "docenteId" FROM "AnalysisJob" WHERE "id" = ${jobId}), '')) < COALESCE((SELECT "perUser" FROM "SystemControl" WHERE "id" = 'ai'), ${limits.perUser})
  `
}

// Persistent cost control: does not silently disappear when Redis is unavailable.
// Consumed only after admission, never by cache reads or requests that share a job.
export async function consumeAnalysisQuota(userId: string) {
  const hour = Math.floor(Date.now() / 3600000)
  const id = createHmac("sha256", process.env.NEXTAUTH_SECRET!).update(`ai-generation:${userId}:${hour}`).digest("hex")
  const row = await prisma.registroVentana.upsert({ where: { id }, create: { id }, update: { intentos: { increment: 1 } } })
  if (row.intentos > (await getAIControl()).hourlyPerUser) {
    throw new AnalysisError("AI_USER_LIMIT", "Alcanzaste el límite de informes de esta hora. Puedes continuar con tus evaluaciones y solicitar el informe más tarde.", 429, Math.max(1, Math.ceil(((hour + 1) * 3600000 - Date.now()) / 1000)))
  }
}
