// Setup COMPLETO e idempotente sobre la base que apunte .env.production.
// Hace: (1) migración multi-tenant, (2) backfill de U.E. normalizado + memberships,
// (3) reset de contraseña del admin. Correr DESPUÉS de `vercel env pull`.
// Uso:  node scripts/setup-prod.mjs ["NuevaClaveAdmin"]
import { readFileSync } from "node:fs"
import { randomUUID } from "node:crypto"
import bcrypt from "bcryptjs"
import { createClient } from "@libsql/client/web"

const ADMIN_PASS = process.argv[2] || "Sideda#Temp2026"
const ADMIN_EMAIL = "admin@sideda.com"

// --- credenciales Turso desde .env.production ---
const env = {}
for (const line of readFileSync(new URL("../.env.production", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (!m) continue
  let v = m[2].trim(); if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
  env[m[1]] = v.replace(/\\n$/, "").trim()
}
if (!env.TURSO_DATABASE_URL) { console.error("Falta TURSO_DATABASE_URL en .env.production. Corré primero: vercel env pull .env.production --environment=production"); process.exit(1) }
console.log("Base:", env.TURSO_DATABASE_URL.replace(/\?.*/, ""))
const db = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN })
const rows = async (sql, args = []) => (await db.execute({ sql, args })).rows
const one = async (sql, args = []) => (await rows(sql, args))[0]
const norm = (s) => (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim().toUpperCase()
const limpio = (s) => (s ?? "").replace(/\s+/g, " ").trim()

// --- 1. MIGRACIÓN (aditiva, idempotente) ---
const DDL = [
  `CREATE TABLE IF NOT EXISTS Organizacion (id TEXT PRIMARY KEY NOT NULL, nombre TEXT NOT NULL, tipo TEXT NOT NULL, parentId TEXT, path TEXT NOT NULL DEFAULT '', codigoSie TEXT, activo INTEGER NOT NULL DEFAULT 1, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE INDEX IF NOT EXISTS Organizacion_parentId_idx ON Organizacion(parentId)`,
  `CREATE INDEX IF NOT EXISTS Organizacion_tipo_idx ON Organizacion(tipo)`,
  `CREATE INDEX IF NOT EXISTS Organizacion_path_idx ON Organizacion(path)`,
  `CREATE TABLE IF NOT EXISTS Membership (id TEXT PRIMARY KEY NOT NULL, usuarioId TEXT NOT NULL, organizacionId TEXT NOT NULL, rol TEXT NOT NULL, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS Membership_usuarioId_organizacionId_key ON Membership(usuarioId, organizacionId)`,
  `CREATE INDEX IF NOT EXISTS Membership_usuarioId_idx ON Membership(usuarioId)`,
  `CREATE INDEX IF NOT EXISTS Membership_organizacionId_idx ON Membership(organizacionId)`,
  `ALTER TABLE Estudiante ADD COLUMN unidadEducativaId TEXT`,
  `ALTER TABLE Evaluacion ADD COLUMN unidadEducativaId TEXT`,
  `CREATE INDEX IF NOT EXISTS Estudiante_unidadEducativaId_idx ON Estudiante(unidadEducativaId)`,
  `CREATE INDEX IF NOT EXISTS Evaluacion_unidadEducativaId_idx ON Evaluacion(unidadEducativaId)`,
]
console.log("\n[1/3] Migración multi-tenant...")
for (const sql of DDL) {
  try { await db.execute(sql) }
  catch (e) { if (!/duplicate column name/i.test(e.message)) console.log("   aviso:", e.message.slice(0, 80)) }
}
console.log("   ✓ tablas y columnas listas")

// --- 2. BACKFILL (normalizado, idempotente) ---
console.log("[2/3] Backfill de Unidades Educativas...")
const distintos = (await rows("SELECT DISTINCT unidadEducativa FROM Estudiante WHERE unidadEducativa IS NOT NULL AND unidadEducativa <> ''")).map(r => r.unidadEducativa)
const grupos = new Map()
for (const v of distintos) { const k = norm(v); if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(v) }
let ueCreadas = 0
for (const [, variantes] of grupos) {
  const canonical = limpio(variantes.sort((a, b) => (norm(a) === a.toUpperCase() ? 1 : 0) - (norm(b) === b.toUpperCase() ? 1 : 0))[0]) || limpio(variantes[0])
  let org = await one("SELECT id FROM Organizacion WHERE tipo='UNIDAD_EDUCATIVA' AND nombre=?", [canonical])
  if (!org) { const id = randomUUID(); await db.execute({ sql: "INSERT INTO Organizacion (id,nombre,tipo,path,activo,createdAt,updatedAt) VALUES (?,?, 'UNIDAD_EDUCATIVA', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)", args: [id, canonical, id] }); org = { id }; ueCreadas++ }
  for (const v of variantes) await db.execute({ sql: "UPDATE Estudiante SET unidadEducativaId=? WHERE unidadEducativa=? AND unidadEducativaId IS NULL", args: [org.id, v] })
}
await db.execute("UPDATE Evaluacion SET unidadEducativaId = (SELECT e.unidadEducativaId FROM Estudiante e WHERE e.id = Evaluacion.estudianteId) WHERE unidadEducativaId IS NULL")
const pares = await rows("SELECT DISTINCT docenteId, unidadEducativaId FROM Estudiante WHERE docenteId IS NOT NULL AND unidadEducativaId IS NOT NULL")
let memCreadas = 0
for (const p of pares) {
  const ex = await one("SELECT id FROM Membership WHERE usuarioId=? AND organizacionId=?", [p.docenteId, p.unidadEducativaId])
  if (!ex) { await db.execute({ sql: "INSERT INTO Membership (id,usuarioId,organizacionId,rol,createdAt) VALUES (?,?,?, 'DOCENTE', CURRENT_TIMESTAMP)", args: [randomUUID(), p.docenteId, p.unidadEducativaId] }); memCreadas++ }
}
const totalEst = (await one("SELECT COUNT(*) c FROM Estudiante")).c
const totalUE = (await one("SELECT COUNT(*) c FROM Organizacion")).c
console.log(`   ✓ ${totalEst} estudiantes · ${totalUE} colegios (${ueCreadas} nuevos) · ${memCreadas} membresías nuevas`)

// --- 3. RESET CONTRASEÑA ADMIN ---
console.log("[3/3] Contraseña del admin...")
const hash = await bcrypt.hash(ADMIN_PASS, 10)
const r = await db.execute({ sql: "UPDATE Usuario SET passwordHash=? WHERE email=?", args: [hash, ADMIN_EMAIL] })
if (r.rowsAffected === 0) console.log(`   ⚠️ No existe ${ADMIN_EMAIL} en esta base.`)
else console.log(`   ✓ contraseña de ${ADMIN_EMAIL} = ${ADMIN_PASS}`)

console.log("\n✅ LISTO. Entrá en https://sideda.com/login")
console.log(`   ${ADMIN_EMAIL} / ${ADMIN_PASS}`)
