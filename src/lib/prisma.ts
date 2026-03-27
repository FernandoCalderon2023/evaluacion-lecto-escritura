import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { createClient } from "@libsql/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim()

  if (tursoUrl) {
    // Producción o cualquier entorno con Turso
    const libsql = createClient({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }

  // Desarrollo local: SQLite archivo
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3")
  const path = require("path")
  const dbPath = path.resolve(process.cwd(), "dev.db")
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  return new PrismaClient({ adapter, log: ["error"] })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
