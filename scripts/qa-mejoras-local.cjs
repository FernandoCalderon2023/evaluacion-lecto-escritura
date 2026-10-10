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
  const password = randomBytes(18).toString('hex')
  for (const name of ['one', 'two', 'admin']) {
    await db.execute({ sql: 'INSERT INTO Usuario (id,email,passwordHash,nombre,rol,activo,createdAt,updatedAt) VALUES (?,?,?,?,?,1,?,?)', args: [randomUUID(), name+'@qa.invalid', await bcrypt.hash(password,10), name, name==='admin'?'ADMIN':'DOCENTE', Date.now(), Date.now()] })
  }
  let hold = false, release, arrived
  const ai = http.createServer(async (req, res) => {
    for await (const ignored of req) { void ignored }
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
  const port = 3017, base = `http://127.0.0.1:${port}`
  const log = openSync(path.join(dir, 'server.log'), 'w')
  const server = spawn(process.execPath, [path.join(cwd,'node_modules/next/dist/bin/next'), 'start', '-p', String(port), '-H', '127.0.0.1'], {
    cwd, stdio: ['ignore', log, log], env: {
      ...process.env, TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: '', NEXTAUTH_SECRET: randomBytes(32).toString('hex'), NEXTAUTH_URL: base,
      UPSTASH_REDIS_REST_URL: '', UPSTASH_REDIS_REST_TOKEN: '', QSTASH_TOKEN: '', AI_QUEUE_MODE: 'inline',
      DEEPSEEK_API_KEY: 'local-test-only', DEEPSEEK_BASE_URL: `http://127.0.0.1:${ai.address().port}`,
      ANTHROPIC_API_KEY: 'local-test-only', SENTRY_DSN: '', NEXT_PUBLIC_SENTRY_DSN: '',
    },
  })
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
    async function login(email) {
      const jar = new Map()
      const request = async (route, options={}) => {
        const r = await fetch(base+route, { ...options, redirect:'manual', headers:{...options.headers, Cookie:[...jar].map(([k,v])=>`${k}=${v}`).join('; ')} })
        for (const c of r.headers.getSetCookie()) { const p=c.split(';')[0], i=p.indexOf('='); jar.set(p.slice(0,i),p.slice(i+1)) }
        return r
      }
      const {csrfToken} = await (await request('/api/auth/csrf')).json()
      await request('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email,password,csrfToken,json:'true'})})
      check('Sesión '+email, (await (await request('/api/auth/session')).json()).user?.email===email)
      return request
    }
    for (const [route, expected] of [["/", "Comprende mejor"], ["/demo", "familia"], ["/login", "Contraseña"]]) {
      const page = await fetch(base+route)
      check('Página pública '+route, page.status===200 && (await page.text()).includes(expected))
    }
    check('Guía exige sesión', (await fetch(base+'/guia',{redirect:'manual'})).status===307)
    const one=await login('one@qa.invalid'), two=await login('two@qa.invalid')
    const admin=await login('admin@qa.invalid')
    const json = (method, body) => ({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    check('Guía disponible al docente', (await (await one('/guia')).text()).includes('Guía'))
    const adminSession=await (await admin('/api/auth/session')).json()
    check('Administrador no desactiva su cuenta', (await admin('/api/admin/usuarios/'+adminSession.user.id,json('PATCH',{activo:false}))).status===400)
    check('Validación de estado de cuenta', (await admin('/api/admin/usuarios/missing',json('PATCH',{activo:"false"}))).status===400)
    check('Cuenta inexistente devuelve 404', (await admin('/api/admin/usuarios/missing',json('PATCH',{activo:false}))).status===404)
    check('Docente no administra cuentas', (await one('/api/admin/usuarios/missing',json('PATCH',{activo:false}))).status===403)
    check('Panel administrativo renderizado', (await (await admin('/admin')).text()).includes('Accesos del equipo'))
    const studentResponse=await one('/api/estudiantes',json('POST',{nombre:'QA',apellido1:'Sintetico',fechaNac:'2018-01-01',grado:'3º de Primaria',unidadEducativa:'QA local',gestion:2026,docente:'QA',sexo:'F'}))
    check('Crear estudiante sintético',studentResponse.status===201)
    const student=await studentResponse.json()
    const create=await one('/api/evaluaciones',json('POST',{estudianteId:student.id,evaluador:'QA'}))
    check('Guardar evaluación parcial',create.status===201)
    const ev=await create.json()
    check('Sin valores positivos por defecto',ev.dict_caligUnif==='' && ev.dict_invierte==='')
    check('Estado parcial persistido',ev.estadoAprendizaje==='evaluacion-incompleta')
    check('Otro docente no lee la evaluación',(await two('/api/evaluaciones/'+ev.id)).status===403)
    const forbidden=await two('/evaluaciones/'+ev.id+'/editar')
    const forbiddenHtml=await forbidden.text()
    check('Página de edición no filtra datos ajenos',!forbiddenHtml.includes(student.codigo) && !forbiddenHtml.includes('Editar Evaluación'))
    check('Otro docente no edita la evaluación',(await two('/api/evaluaciones/'+ev.id,json('PUT',{observaciones:'No autorizado'}))).status===403)
    const editHtml=await (await one('/evaluaciones/'+ev.id+'/editar')).text()
    check('Dueño puede abrir edición',editHtml.includes('Editar Evaluación'))
    const complete={...ev}
    delete complete.analysisJobs
    for(const k of Object.keys(complete)) {
      if(k.startsWith('ej') && typeof complete[k]==='boolean') complete[k]=true
      if(/^(dict|comp)_/.test(k)) complete[k]=/_(calig|coh|prod)/.test(k)?'B':'N'
    }
    for(const k of ['compMemoriza','compIdeas','compValora','compInterpreta','compAsocia']) complete[k]='S'
    const completed=await one('/api/evaluaciones/'+ev.id,json('PUT',complete))
    check('Actualizar con evaluación completa',completed.status===200)
    check('Puntaje completo sin dificultad',(await completed.json()).estadoAprendizaje==='sin-dificultades')
    const partialPut=await one('/api/evaluaciones/'+ev.id,json('PUT',{observaciones:'Edición de una sola observación'}))
    check('PUT parcial conserva puntuaciones',(await partialPut.json()).scoreCognitivo===27)
    const aiResponse=await one('/api/evaluaciones/'+ev.id+'/analisis',{method:'POST'})
    check('Generación con proveedor simulado',aiResponse.status===200)
    const afterAI=await (await one('/api/evaluaciones/'+ev.id)).json()
    check('IA no reemplaza clasificación del instrumento',afterAI.estadoAprendizaje==='sin-dificultades' && JSON.parse(afterAI.analisisIA).perfilDAE.nivelDificultad==='dificultad-severa')
    hold=true
    const incoming=new Promise(resolve=>{arrived=resolve})
    const racing=one('/api/evaluaciones/'+ev.id+'/analisis',{method:'POST'})
    await Promise.race([incoming,new Promise((_,reject)=>setTimeout(()=>reject(new Error('No llegó solicitud IA')),15000))])
    await one('/api/evaluaciones/'+ev.id,json('PUT',{observaciones:'Edición durante generación'}))
    release()
    check('Informe antiguo rechazado tras edición',(await racing).status===500)
    check('No se persiste informe obsoleto',(await (await one('/api/evaluaciones/'+ev.id)).json()).analisisIA===null)
    hold=false
    await one('/api/evaluaciones',json('POST',{estudianteId:student.id,evaluador:'QA',fecha:'2030-01-01'}))
    const dashboard=await (await one('/api/dashboard')).json()
    check('Dashboard: 1 estudiante, 2 evaluaciones',dashboard.totalEstudiantes===1 && dashboard.totalEvaluaciones===2)
    check('Dashboard usa última evaluación',dashboard.porEstado['evaluacion-incompleta']===1 && Object.values(dashboard.porEstado).reduce((a,b)=>a+b,0)===1)
    const html=await (await one('/dashboard')).text()
    check('Panel renderizado con criterio explícito',html.includes('Cada estudiante se cuenta una sola vez'))
    writeFileSync(path.join(dir,'resultados.json'),JSON.stringify({passed,productionAccess:false,ai:'local fake'},null,2))
    console.log(`${passed.length} comprobaciones correctas. Evidencia: ${dir}`)
  } finally {
    server.kill('SIGTERM'); ai.close(); db.close(); closeSync(log)
  }
}
main().catch(e=>{console.error(e);process.exitCode=1})
