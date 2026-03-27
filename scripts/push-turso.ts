import { createClient } from "@libsql/client"
import fs from "fs"
import path from "path"

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

if (!url || !authToken) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN")
  process.exit(1)
}

const client = createClient({ url, authToken })

// Read the local dev.db schema and recreate on Turso
// We'll extract CREATE TABLE statements from prisma db push output
const schema = `
CREATE TABLE IF NOT EXISTS "Estudiante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido1" TEXT NOT NULL,
    "apellido2" TEXT,
    "fechaNac" DATETIME NOT NULL,
    "grado" TEXT NOT NULL,
    "unidadEducativa" TEXT NOT NULL,
    "gestion" INTEGER NOT NULL,
    "docente" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "codigoRude" TEXT,
    "domicilio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
`

async function main() {
  // Get the actual schema from local SQLite
  const dbPath = path.resolve(process.cwd(), "dev.db")
  if (!fs.existsSync(dbPath)) {
    console.error("Run 'npx prisma db push' locally first to create dev.db")
    process.exit(1)
  }

  // Use better-sqlite3 to read the schema
  const Database = require("better-sqlite3")
  const db = new Database(dbPath)
  const tables = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations'").all()
  db.close()

  console.log(`Pushing ${tables.length} tables to Turso...`)

  for (const t of tables) {
    const sql = (t as any).sql as string
    if (!sql) continue
    // Add IF NOT EXISTS
    const safeSql = sql.replace("CREATE TABLE", "CREATE TABLE IF NOT EXISTS")
    console.log(`  → ${safeSql.slice(0, 60)}...`)
    await client.execute(safeSql)
  }

  // Also push indexes
  const indexes = db ? [] : []
  const db2 = new Database(dbPath)
  const idxs = db2.prepare("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all()
  db2.close()

  for (const idx of idxs) {
    const sql = (idx as any).sql as string
    if (!sql) continue
    const safeSql = sql.replace("CREATE INDEX", "CREATE INDEX IF NOT EXISTS").replace("CREATE UNIQUE INDEX", "CREATE UNIQUE INDEX IF NOT EXISTS")
    console.log(`  → ${safeSql.slice(0, 60)}...`)
    await client.execute(safeSql)
  }

  console.log("✅ Schema pushed to Turso!")
}

main().catch(console.error)
