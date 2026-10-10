// Deployment order: run this migration, then deploy the application.
// Outbound email: configure RESEND_API_KEY and SYSTEM_EMAIL_FROM (verified sender)
// in Vercel Production, then redeploy. No API keys belong in this file.
// Pending notices are visible in /admin and retried daily or by an administrator.
// Resend API reference: https://resend.com/docs/api-reference/emails/send-email
// Run with environment already loaded. Additive and idempotent; no data resets.
const { createClient } = require('@libsql/client')
const { readFileSync } = require('node:fs')
const path = require('node:path')
async function main(){
 const url=process.env.TURSO_DATABASE_URL?.trim()
 if(!url)throw new Error('TURSO_DATABASE_URL is required')
 const db=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN?.trim()})
 try {
  await db.executeMultiple(readFileSync(path.join(__dirname,'../prisma/commercial.sql'),'utf8'))
  for(const table of ['AccesoComercial','RegistroVentana','AvisoSistema']) await db.execute(`SELECT COUNT(*) FROM ${table}`)
  console.log('Commercial tables ready. Existing accounts unchanged.')
 } finally { db.close() }
}
main().catch(()=>{console.error('Commercial migration failed');process.exitCode=1})
