import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { createClient } from "@libsql/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"
import path from "path"

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
  let prisma: PrismaClient

  if (tursoUrl) {
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN?.trim(),
    })
    prisma = new PrismaClient({ adapter })
  } else {
    const dbPath = path.resolve(process.cwd(), "dev.db")
    const adapter = new PrismaBetterSqlite3({ url: dbPath })
    prisma = new PrismaClient({ adapter })
  }

  const email = process.argv[2] || "admin@sideda.com"
  const password = process.argv[3] || "admin2026"
  const nombre = process.argv[4] || "Administrador SIDEDA"

  const exists = await prisma.usuario.findUnique({ where: { email } })
  if (exists) {
    console.log(`Usuario ${email} ya existe`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.usuario.create({
    data: { email, passwordHash, nombre, rol: "ADMIN" },
  })

  console.log(`✅ Admin creado: ${user.email} (${user.nombre})`)
  console.log(`   Contraseña: ${password}`)
  await prisma.$disconnect()
}

main().catch(console.error)
