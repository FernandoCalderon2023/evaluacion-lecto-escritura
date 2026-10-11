const {createClient}=require('@libsql/client')
async function main(){
 const db=createClient({url:process.env.TURSO_DATABASE_URL.trim(),authToken:process.env.TURSO_AUTH_TOKEN?.trim()})
 try {
  const columns=(await db.execute('PRAGMA table_info(Usuario)')).rows
  for(const name of ['lastSeenAt','lastLoginAt']) if(!columns.some(c=>c.name===name)) await db.execute(`ALTER TABLE Usuario ADD COLUMN ${name} DATETIME`)
  await db.execute('CREATE INDEX IF NOT EXISTS Usuario_lastSeenAt_idx ON Usuario(lastSeenAt)')
  await db.execute('CREATE TABLE IF NOT EXISTS SystemControl (id TEXT PRIMARY KEY NOT NULL, paused BOOLEAN NOT NULL DEFAULT false, parallelism INTEGER NOT NULL DEFAULT 3, perUser INTEGER NOT NULL DEFAULT 1, hourlyPerUser INTEGER NOT NULL DEFAULT 20, revision INTEGER NOT NULL DEFAULT 0, updatedBy TEXT, updatedAt DATETIME NOT NULL)')
  console.log('Control center schema ready; accounts and passwords unchanged.')
 }finally{db.close()}
}
main().catch(()=>{console.error('Control center migration failed');process.exitCode=1})
