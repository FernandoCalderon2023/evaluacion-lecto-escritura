// Resetea la contraseña de un usuario en la base de PRODUCCIÓN (Turso).
// Uso:   node scripts/reset-admin.mjs ["NuevaClave"] [email]
// Ej:    node scripts/reset-admin.mjs                      -> admin@sideda.com / Sideda#Temp2026
//        node scripts/reset-admin.mjs "MiClaveSegura"      -> admin@sideda.com / MiClaveSegura
// Lee las credenciales de Turso desde .env.production (NO las imprime).
import { readFileSync } from "node:fs"
import bcrypt from "bcryptjs"
import { createClient } from "@libsql/client/web"

const nueva = process.argv[2] || "Sideda#Temp2026"
const email = process.argv[3] || "admin@sideda.com"
if (nueva.length < 6) {
  console.error("La contraseña debe tener al menos 6 caracteres.")
  process.exit(1)
}

// Parsear .env.production de forma robusta
const env = {}
for (const line of readFileSync(new URL("../.env.production", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (!m) continue
  let v = m[2].trim()
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
  env[m[1]] = v.replace(/\\n$/, "").trim()
}

const url = env.TURSO_DATABASE_URL
const authToken = env.TURSO_AUTH_TOKEN
if (!url) {
  console.error("No encontré TURSO_DATABASE_URL en plataforma/.env.production")
  process.exit(1)
}

const db = createClient({ url, authToken })
const hash = await bcrypt.hash(nueva, 10)
const r = await db.execute({
  sql: "UPDATE Usuario SET passwordHash = ? WHERE email = ?",
  args: [hash, email],
})

if (r.rowsAffected === 0) {
  console.log(`⚠️  No existe el usuario ${email}. Revisá el email.`)
} else {
  console.log(`✅ Contraseña de ${email} actualizada.`)
  console.log(`   Entrá en https://plataforma-seven-chi.vercel.app con:`)
  console.log(`   Email:      ${email}`)
  console.log(`   Contraseña: ${nueva}`)
  console.log(`   (Cambiala después desde el sistema.)`)
}
