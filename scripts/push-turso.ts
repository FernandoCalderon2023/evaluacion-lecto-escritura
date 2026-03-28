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

async function main() {
  const dbPath = path.resolve(process.cwd(), "dev.db")
  if (!fs.existsSync(dbPath)) {
    console.error("Run 'npx prisma db push' locally first to create dev.db")
    process.exit(1)
  }

  const Database = require("better-sqlite3")
  const db = new Database(dbPath)

  // Drop existing tables first (reverse order for FK)
  console.log("Dropping existing tables...")
  await client.execute("DROP TABLE IF EXISTS Evaluacion")
  await client.execute("DROP TABLE IF EXISTS Estudiante")

  // Recreate from local schema
  const tables = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations'").all()

  console.log(`Creating ${tables.length} tables on Turso...`)
  for (const t of tables) {
    const sql = (t as any).sql as string
    if (!sql) continue
    console.log(`  → ${sql.slice(0, 60)}...`)
    await client.execute(sql)
  }

  // Recreate indexes
  const idxs = db.prepare("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL").all()
  for (const idx of idxs) {
    const sql = (idx as any).sql as string
    if (!sql) continue
    const safeSql = sql.replace("CREATE INDEX", "CREATE INDEX IF NOT EXISTS").replace("CREATE UNIQUE INDEX", "CREATE UNIQUE INDEX IF NOT EXISTS")
    console.log(`  → ${safeSql.slice(0, 60)}...`)
    await client.execute(safeSql)
  }

  db.close()
  console.log("✅ Schema pushed to Turso (tables recreated)!")
}

main().catch(console.error)
