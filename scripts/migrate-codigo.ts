import { createClient } from "@libsql/client"

const url = process.env.TURSO_DATABASE_URL!
const authToken = process.env.TURSO_AUTH_TOKEN!

if (!url || !authToken) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN")
  process.exit(1)
}

const client = createClient({ url, authToken })

function generarCodigo(nombre: string, apellido1: string, apellido2: string | null, rude?: string | null): string {
  const limpiar = (s: string) => s.trim().normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase()
  const initials = [
    limpiar(apellido1)[0] ?? "X",
    apellido2 ? (limpiar(apellido2)[0] ?? "") : "",
    limpiar(nombre)[0] ?? "X",
  ].filter(Boolean).join("")
  let sufijo: string
  if (rude && rude.trim().length > 0) {
    const clean = rude.replace(/[^A-Z0-9]/gi, "").toUpperCase()
    sufijo = clean.slice(-4).padStart(4, "0")
  } else {
    sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
  }
  return `${initials}-${sufijo}`
}

async function main() {
  // 1. Verificar si la columna ya existe
  const cols = await client.execute("PRAGMA table_info(Estudiante)")
  const hasCodigo = cols.rows.some((r: any) => r.name === "codigo")

  if (!hasCodigo) {
    console.log("Agregando columna codigo...")
    await client.execute('ALTER TABLE Estudiante ADD COLUMN codigo TEXT')
  } else {
    console.log("Columna codigo ya existe")
  }

  // 2. Asignar códigos a estudiantes que no los tengan
  const sin = await client.execute('SELECT id, nombre, apellido1, apellido2, codigoRude FROM Estudiante WHERE codigo IS NULL OR codigo = ""')
  console.log(`Estudiantes sin código: ${sin.rows.length}`)

  for (const row of sin.rows) {
    const r = row as any
    let codigo = generarCodigo(r.nombre, r.apellido1, r.apellido2, r.codigoRude)
    // verificar unicidad
    for (let i = 0; i < 5; i++) {
      const ex = await client.execute({ sql: 'SELECT id FROM Estudiante WHERE codigo = ?', args: [codigo] })
      if (ex.rows.length === 0) break
      codigo = `${codigo}${Math.random().toString(36).slice(2, 4).toUpperCase()}`
    }
    await client.execute({ sql: 'UPDATE Estudiante SET codigo = ? WHERE id = ?', args: [codigo, r.id] })
    console.log(`  ${r.id} → ${codigo}`)
  }

  // 3. Crear índice único si no existe
  try {
    await client.execute('CREATE UNIQUE INDEX IF NOT EXISTS Estudiante_codigo_key ON Estudiante(codigo)')
    console.log("✅ Índice único Estudiante_codigo_key creado")
  } catch (e) {
    console.log("Índice ya existe o error:", (e as Error).message)
  }

  console.log("✅ Migración completada")
}

main().catch(console.error)
