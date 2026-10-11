// Isolated integration QA: temporary SQLite DB + local fake AI. No production access.
const { createClient } = require('@libsql/client')
const bcrypt = require('bcryptjs')
const { randomUUID, randomBytes } = require('node:crypto')
const { execFileSync, spawn } = require('node:child_process')
const { mkdtempSync, writeFileSync, openSync, closeSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const http = require('node:http')
const assert = require('node:assert/strict')
const { once } = require('node:events')

async function main() {
  const cwd = path.resolve(__dirname, '..')
  const dir = mkdtempSync(path.join(tmpdir(), 'sideda-qa-'))
  const url = 'file:' + path.join(dir, 'qa.db')
  const db = createClient({ url })
  const schema = execFileSync(path.join(cwd, 'node_modules/.bin/prisma'), ['migrate', 'diff', '--from-empty', '--to-schema', 'prisma/schema.prisma', '--script'], { cwd, encoding: 'utf8' })
  await db.executeMultiple(schema)
  await db.execute("PRAGMA journal_mode=WAL")
  const password = randomBytes(18).toString('hex')
  for (const name of Array.from({length:20},(_,i)=>'user'+i)) {
    await db.execute({ sql: 'INSERT INTO Usuario (id,email,passwordHash,nombre,rol,activo,createdAt,updatedAt) VALUES (?,?,?,?,?,1,?,?)', args: [randomUUID(), name+'@qa.invalid', await bcrypt.hash(password,10), name, name==='admin'?'ADMIN':'DOCENTE', Date.now(), Date.now()] })
  }
  let mailMode = "fail"
  const mails = []
  let hold = false, release, arrived, active=0, peak=0, calls=0, fail=false
  const ai = http.createServer(async (req, res) => {
    let body = ""
    for await (const chunk of req) body += chunk
    if (req.url === '/mail') {
      res.setHeader('Content-Type','application/json')
      if (mailMode === 'fail') { res.statusCode=503; res.end(JSON.stringify({error:'simulated outage'})); return }
      mails.push({payload:JSON.parse(body),key:req.headers['idempotency-key']})
      res.end(JSON.stringify({id:'qa-message-'+mails.length}));return
    }
    calls++; active++; peak=Math.max(peak,active)
    await new Promise(r=>setTimeout(r,1200))
    active--
    if(fail){res.statusCode=503;res.end('PRIVATE PROVIDER ERROR');return}
    if (hold) { arrived(); await new Promise(resolve => { release = resolve }) }
    const report = {
      perfilDAE: { resumen: 'Interpretación de prueba', nivelDificultad: 'dificultad-severa', areasAfectadas: [], relacionEdadGrado: 'Prueba', desfaseAnios: null },
      perfilPsicomotor: null, perfilIntegrado: null, fortalezas: ['Prueba'], areasDeMejora: [],
      recomendaciones: { paraElAula: [], paraLaFamilia: [], derivacion: { necesaria: false } },
      planSeguimiento: { periodoRevaluacion: 'Prueba', indicadoresProgreso: [] },
    }
    res.setHeader('Content-Type','application/json')
    res.end(JSON.stringify({ choices: [{ message: { tool_calls: [{ function: { arguments: JSON.stringify(report) } }] } }] }))
  })
  ai.listen(0, '127.0.0.1'); await once(ai, 'listening')
  const port = 3018, base = `http://127.0.0.1:${port}`
  const log = openSync(path.join(dir, 'server.log'), 'w')
  const signingKey = randomBytes(32).toString("hex")
  const authSecret = randomBytes(32).toString("hex")
  const servers = [3018,3019].map(port => spawn(process.execPath, [path.join(cwd,'node_modules/next/dist/bin/next'), 'start', '-p', String(port), '-H', '127.0.0.1'], {
    cwd, stdio: ['ignore', log, log], env: {
      ...process.env, TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: '', NEXTAUTH_SECRET: authSecret, NEXTAUTH_URL: base,
      UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '', QSTASH_TOKEN: '', QSTASH_CURRENT_SIGNING_KEY:signingKey, QSTASH_NEXT_SIGNING_KEY:signingKey, AI_QUEUE_MODE: 'inline', AI_MAX_CONCURRENT:'3', AI_MAX_CONCURRENT_PER_USER:'1', AI_MAX_PER_USER_HOUR:'20',
      DEEPSEEK_API_KEY: 'local-test-only', DEEPSEEK_BASE_URL: `http://127.0.0.1:${ai.address().port}`,
      RESEND_API_KEY: 'local-test-only', SYSTEM_EMAIL_FROM: 'test@qa.invalid', RESEND_API_URL: `http://127.0.0.1:${ai.address().port}/mail`, CRON_SECRET: randomBytes(24).toString('hex'),
      ANTHROPIC_API_KEY: 'local-test-only', SENTRY_DSN: '', NEXT_PUBLIC_SENTRY_DSN: '',
    },
  }))
  const server = servers[0]
  const waitFor = async predicate => { for(let i=0;i<80;i++){if(await predicate())return;await new Promise(r=>setTimeout(r,100))}throw new Error('La tarea asíncrona no terminó') }
  const passed = []
  const check = (name, condition) => { assert.ok(condition, name); passed.push(name); console.log('PASS',name) }
  try {
    let ready = false
    for (let i=0;i<40;i++) {
      if (server.exitCode !== null) throw new Error('Servidor terminó; revisar '+dir)
      try { if ((await fetch(base+'/login')).ok) { ready=true; break } } catch {}
      await new Promise(r=>setTimeout(r,500))
    }
    assert.ok(ready, 'Servidor disponible')
    async function login(email, loginPassword=password, expectAuth=true) {
      const jar = new Map()
      const request = async (route, options={}) => {
        const target = options.instance === 1 ? "http://127.0.0.1:3019" : base
        delete options.instance
        const r = await fetch(target+route, { ...options, redirect:'manual', headers:{...options.headers, Cookie:[...jar].map(([k,v])=>`${k}=${v}`).join('; ')} })
        for (const c of r.headers.getSetCookie()) { const p=c.split(';')[0], i=p.indexOf('='); jar.set(p.slice(0,i),p.slice(i+1)) }
        return r
      }
      const {csrfToken} = await (await request('/api/auth/csrf')).json()
      await request('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email,password:loginPassword,csrfToken,json:'true'})})
      const identity=(await (await request('/api/auth/session')).json()).user?.email
      check((expectAuth?'Sesión ':'Acceso rechazado ')+email, expectAuth?identity===email:!identity)
      return request
    }
    for(let i=0;i<40;i++){try{if((await fetch('http://127.0.0.1:3019/login')).ok)break}catch{} await new Promise(r=>setTimeout(r,500))}
    const users=[]
    const json=(method,body)=>({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    for(let i=0;i<20;i++) {
      const request=await login('user'+i+'@qa.invalid')
      const student=await (await request('/api/estudiantes',json('POST',{nombre:'Sintetico',apellido1:'Carga'+i,fechaNac:'2018-01-01',grado:'3º de Primaria',unidadEducativa:'QA',gestion:2026,docente:'QA',sexo:'F'}))).json()
      const evaluation=await (await request('/api/evaluaciones',json('POST',{estudianteId:student.id,evaluador:'QA'}))).json()
      assert.ok(evaluation.id)
      users.push({request,student,evaluation})
    }
    const generate=(i,regenerate=false)=>users[i].request('/api/evaluaciones/'+users[i].evaluation.id+'/analisis',{method:'POST',instance:i%2,...(regenerate?json('POST',{regenerar:true}):{})})
    const first=await Promise.all(users.map((_,i)=>generate(i)))
    const statuses=first.map(r=>r.status)
    check('Ráfaga de 20 usuarios entre dos instancias admite 3',statuses.filter(s=>s===200).length===3)
    check('Exceso de carga devuelve 429 con Retry-After',first.filter(r=>r.status===429).length===17 && first.filter(r=>r.status===429).every(r=>Number(r.headers.get('Retry-After'))>0))
    check('Límite global nunca excedido',peak===3)
    for(let i=0;i<20;i++) if(statuses[i]===429) check('Reintento completa usuario '+i,(await generate(i)).status===200)
    check('20 informes guardados sin mezcla',(await db.execute('SELECT COUNT(*) n FROM Evaluacion WHERE analisisIA IS NOT NULL')).rows[0].n===20)
    const beforeCache=calls
    check('Caché no consume proveedor',(await (await generate(0)).json()).cached===true && calls===beforeCache)
    const beforeDuplicate=calls
    const duplicate=await Promise.all(Array.from({length:8},(_,i)=>users[0].request('/api/evaluaciones/'+users[0].evaluation.id+'/analisis',{...json('POST',{regenerar:true}),instance:i%2})))
    const duplicateBodies=await Promise.all(duplicate.map(r=>r.json()))
    const duplicateTransientErrors=duplicate.filter(r=>r.status===503).length
    check('Ocho solicitudes no duplican el trabajo',new Set(duplicateBodies.filter(b=>b.jobId).map(b=>b.jobId)).size===1 && calls===beforeDuplicate+1 && duplicate.every(r=>[200,503].includes(r.status)))
    if(duplicateTransientErrors) console.log('LIMITACIÓN: contención SQLite local en '+duplicateTransientErrors+' solicitudes; reintento explícito requerido')
    check('Consulta posterior a ráfaga recupera informe',(await (await generate(0)).json()).cached===true)
    const extra=await (await users[0].request('/api/evaluaciones',json('POST',{estudianteId:users[0].student.id,evaluador:'QA'}))).json()
    const running=generate(0,true)
    await waitFor(async()=>active===1)
    check('Un usuario no ocupa dos plazas',(await users[0].request('/api/evaluaciones/'+extra.id+'/analisis',{method:'POST',instance:1})).status===429)
    await running
    check('No consulta informe ajeno',(await users[1].request('/api/evaluaciones/'+users[0].evaluation.id+'/analisis')).status===403)
    fail=true
    const failure=await generate(2,true), error=await failure.json()
    check('Fallo del proveedor no filtra detalles',failure.status===503 && error.code==='AI_UNAVAILABLE' && !error.error.includes('PRIVATE'))
    fail=false
    check('Fallo libera plaza y permite reintento',(await generate(2,true)).status===200)
    const old=new Date(Date.now()-7*60000).toISOString(), expired=randomUUID()
    await db.execute({sql:'INSERT INTO AnalysisJob (id,evaluacionId,docenteId,status,activeKey,startedAt,createdAt,updatedAt) VALUES (?,?,?, ?,?,?,?,?)',args:[expired,extra.id,'expired-user','processing',extra.id,old,old,old]})
    check('Trabajo abandonado libera plaza',(await users[0].request('/api/evaluaciones/'+extra.id+'/analisis',{method:'POST'})).status===200)
    check('Trabajo abandonado marcado fallido',(await db.execute({sql:'SELECT status FROM AnalysisJob WHERE id=?',args:[expired]})).rows[0].status==='failed')
    const {SignJWT}=require('jose'), {createHash}=require('node:crypto')
    async function deliver(body, retry=0, signed=true) {
      const data=JSON.stringify(body), target=base+'/api/jobs/process-analysis'
      const signature=await new SignJWT({body:createHash('sha256').update(data).digest('base64url')}).setProtectedHeader({alg:'HS256'}).setIssuer('Upstash').setSubject(target).setIssuedAt().setExpirationTime('5m').sign(new TextEncoder().encode(signingKey))
      return fetch(target,{method:'POST',headers:{'Content-Type':'application/json','Upstash-Retried':String(retry),...(signed?{'Upstash-Signature':signature}:{})},body:data})
    }
    async function queueJob(i) {
      const id=randomUUID(), evaluation=users[i].evaluation.id
      const owner=(await db.execute({sql:'SELECT docenteId FROM Evaluacion WHERE id=?',args:[evaluation]})).rows[0].docenteId
      await db.execute({sql:"INSERT INTO AnalysisJob (id,evaluacionId,docenteId,status,activeKey,createdAt,updatedAt) VALUES (?,?,?,'queued',?,?,?)",args:[id,evaluation,owner,evaluation,new Date().toISOString(),new Date().toISOString()]})
      return {jobId:id,evaluacionId:evaluation}
    }
    const workerJob=await queueJob(4), beforeWorker=calls
    check('Worker rechaza entrega sin firma',!(await deliver(workerJob,0,false)).ok && calls===beforeWorker)
    check('Worker rechaza cuerpo inválido firmado',(await deliver({})).status===489)
    const workerRunning=deliver(workerJob)
    await waitFor(async()=>active===1)
    check('Entrega duplicada no repite generación',(await deliver(workerJob)).status===202)
    check('Worker firmado completa informe',(await workerRunning).status===200 && calls===beforeWorker+1)
    check('Reentrega completada usa informe existente',(await deliver(workerJob)).status===200 && calls===beforeWorker+1)
    const blockers=[generate(5,true),generate(6,true),generate(7,true)]
    await waitFor(async()=>active===3)
    const queued=await queueJob(8)
    const busyWorker=await deliver(queued)
    check('Cola ocupada solicita reintento',busyWorker.status===503 && busyWorker.headers.get('Retry-After')==='60')
    const exhausted=await deliver(queued,5)
    check('Último reintento libera trabajo en cola',exhausted.status===200 && (await db.execute({sql:'SELECT status,activeKey FROM AnalysisJob WHERE id=?',args:[queued.jobId]})).rows[0].activeKey===null)
    await Promise.all(blockers)
    const fenced=generate(9,true)
    await waitFor(async()=>active===1)
    await db.execute({sql:"UPDATE AnalysisJob SET status='failed',activeKey=NULL WHERE evaluacionId=? AND status='processing'",args:[users[9].evaluation.id]})
    check('Worker cancelado no guarda un resultado tardío',(await fenced).status===409)
    const userId=(await db.execute("SELECT id FROM Usuario WHERE email='user3@qa.invalid'")).rows[0].id
    const {createHmac}=require('node:crypto')
    // Obtain the synthetic server secret from the spawn environment, never a production secret.
    const quotaId=createHmac('sha256',authSecret).update(`ai-generation:${userId}:${Math.floor(Date.now()/3600000)}`).digest('hex')
    await db.execute({sql:'UPDATE RegistroVentana SET intentos=20 WHERE id=?',args:[quotaId]})
    const beforeQuota=calls, limited=await generate(3,true)
    check('Cuota por usuario bloquea antes de llamar IA',limited.status===429 && (await limited.json()).code==='AI_USER_LIMIT' && calls===beforeQuota)
    const quota=(await db.execute('SELECT id FROM RegistroVentana')).rows
    check('Cuota persistente registrada sin Redis',quota.length>=20)
    check('Ningún trabajo queda activo',(await db.execute("SELECT COUNT(*) n FROM AnalysisJob WHERE status IN ('processing','queued')")).rows[0].n===0)
    writeFileSync(path.join(dir,'resultados.json'),JSON.stringify({passed,users:20,instances:2,peak,calls,duplicateTransientErrors,productionAccess:false,ai:'simulated, 1200 ms'},null,2))
    console.log(`${passed.length} comprobaciones correctas. Evidencia: ${dir}`)
  } finally {
    for(const server of servers)server.kill('SIGTERM')
    ai.close(); db.close(); closeSync(log)
  }
}
main().catch(e=>{console.error(e);process.exitCode=1})
