// Additive, idempotent. Run before deploying the institutional package feature.
// Does not create accounts or change existing subscriptions.
const { createClient } = require('@libsql/client')
const { readFileSync } = require('node:fs')
const path = require('node:path')
async function main() {
 const url = process.env.TURSO_DATABASE_URL?.trim()
 if (!url) throw new Error('TURSO_DATABASE_URL required')
 const db = createClient({url, authToken:process.env.TURSO_AUTH_TOKEN?.trim()})
 try {
  await db.executeMultiple(readFileSync(path.join(__dirname,'../prisma/institutions.sql'),'utf8'))
  for (const table of ['InstitucionPlan','InstitucionMiembro']) await db.execute(`SELECT COUNT(*) FROM ${table}`)
  console.log('Institutional tables ready. Existing accounts unchanged.')
 } finally { db.close() }
}
main().catch(()=>{console.error('Institutional migration failed'); process.exitCode=1})
