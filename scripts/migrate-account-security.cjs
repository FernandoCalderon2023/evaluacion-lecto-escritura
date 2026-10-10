const {createClient}=require('@libsql/client')
const {readFileSync}=require('node:fs')
const path=require('node:path')
async function main(){
 const db=createClient({url:process.env.TURSO_DATABASE_URL.trim(),authToken:process.env.TURSO_AUTH_TOKEN?.trim()})
 try{
  const cols=await db.execute('PRAGMA table_info(Usuario)')
  if(!cols.rows.some(r=>r.name==='sessionVersion'))await db.execute('ALTER TABLE Usuario ADD COLUMN sessionVersion INTEGER NOT NULL DEFAULT 0')
 const evalCols=await db.execute('PRAGMA table_info(Evaluacion)')
 for(const name of ['cognitivoAplicado','lexicoAplicado']) {
  if(!evalCols.rows.some(r=>r.name===name))await db.execute(`ALTER TABLE Evaluacion ADD COLUMN ${name} BOOLEAN NOT NULL DEFAULT false`)
 }
 const jobCols=await db.execute('PRAGMA table_info(AnalysisJob)')
 if(!jobCols.rows.some(r=>r.name==='activeKey'))await db.execute('ALTER TABLE AnalysisJob ADD COLUMN activeKey TEXT')
 await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS AnalysisJob_activeKey_key ON AnalysisJob(activeKey)')
  await db.executeMultiple(readFileSync(path.join(__dirname,'../prisma/account-security.sql'),'utf8'))
  console.log('Account security schema ready; existing passwords unchanged.')
 }finally{db.close()}
}
main().catch(()=>{console.error('Account migration failed');process.exitCode=1})
