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
  let mailMode = "fail"
  const mails = []
  let hold = false, release, arrived
  const ai = http.createServer(async (req, res) => {
    let body = ""
    for await (const chunk of req) body += chunk
    if (req.url === '/mail') {
      res.setHeader('Content-Type','application/json')
      if (mailMode === 'fail') { res.statusCode=503; res.end(JSON.stringify({error:'simulated outage'})); return }
      mails.push({payload:JSON.parse(body),key:req.headers['idempotency-key']})
      res.end(JSON.stringify({id:'qa-message-'+mails.length}));return
    }
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
      RESEND_API_KEY: 'local-test-only', SYSTEM_EMAIL_FROM: 'test@qa.invalid', RESEND_API_URL: `http://127.0.0.1:${ai.address().port}/mail`, CRON_SECRET: randomBytes(24).toString('hex'),
      ANTHROPIC_API_KEY: 'local-test-only', SENTRY_DSN: '', NEXT_PUBLIC_SENTRY_DSN: '',
    },
  })
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
        const r = await fetch(base+route, { ...options, redirect:'manual', headers:{...options.headers, Cookie:[...jar].map(([k,v])=>`${k}=${v}`).join('; ')} })
        for (const c of r.headers.getSetCookie()) { const p=c.split(';')[0], i=p.indexOf('='); jar.set(p.slice(0,i),p.slice(i+1)) }
        return r
      }
      const {csrfToken} = await (await request('/api/auth/csrf')).json()
      await request('/api/auth/callback/credentials',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({email,password:loginPassword,csrfToken,json:'true'})})
      const identity=(await (await request('/api/auth/session')).json()).user?.email
      check((expectAuth?'Sesión ':'Acceso rechazado ')+email, expectAuth?identity===email:!identity)
      return request
    }
    for (const [route, expected] of [["/", "Acompañar su aprendizaje"], ["/demo", "familia"], ["/login", "Contraseña"]]) {
      const page = await fetch(base+route)
      check('Página pública '+route, page.status===200 && (await page.text()).includes(expected))
    }
    check('Guía exige sesión', (await fetch(base+'/guia',{redirect:'manual'})).status===307)
    const one=await login('one@qa.invalid'), two=await login('two@qa.invalid')
    const admin=await login('admin@qa.invalid')
    const json = (method, body) => ({method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    check('Guía disponible al docente', (await (await one('/guia')).text()).includes('Guía'))
    check('Instrumento exige sesión', (await fetch(base+'/api/instrumento/original.pdf')).status===401)
    const instrument=await one('/api/instrumento/original.pdf')
    const source=require('node:fs').readFileSync(path.join(cwd,'assets/instrumento/original.pdf'))
    check('PDF profesional conserva bytes originales', instrument.status===200 && Buffer.from(await instrument.arrayBuffer()).equals(source))
    const download=await one('/api/instrumento/original.pdf?descargar=1')
    check('Examen descargable y privado', download.headers.get('content-disposition').startsWith('attachment') && download.headers.get('cache-control')==='private, no-store')
    for(let page=1;page<=13;page++) {
      const image=await one('/api/instrumento/pagina-'+String(page).padStart(2,'0')+'.jpg')
      check('Vista del instrumento página '+page, image.status===200 && image.headers.get('content-type')==='image/jpeg')
    }
    check('Instrumento no permite archivos arbitrarios', (await one('/api/instrumento/secret.txt')).status===404)
    check('Vista completa del cuadernillo disponible', (await one('/evaluaciones/instrumento')).status===200)
    const adminSession=await (await admin('/api/auth/session')).json()
    check('Administrador no desactiva su cuenta', (await admin('/api/admin/usuarios/'+adminSession.user.id,json('PATCH',{activo:false}))).status===400)
    check('Validación de estado de cuenta', (await admin('/api/admin/usuarios/missing',json('PATCH',{activo:"false"}))).status===400)
    check('Cuenta inexistente devuelve 404', (await admin('/api/admin/usuarios/missing',json('PATCH',{activo:false}))).status===404)
    check('Docente no administra cuentas', (await one('/api/admin/usuarios/missing',json('PATCH',{activo:false}))).status===403)
    for (const route of ['/admin', '/admin/usuarios', '/admin/solicitudes', '/admin/organizaciones', '/admin/avisos']) {
      check('Administrador puede abrir '+route, (await admin(route)).status===200)
      const denied = await one(route, {redirect:'manual'})
      check('Docente no abre '+route, denied.status===307 && denied.headers.get('location')==='/dashboard')
    }
    check('Panel administrativo renderizado', (await (await admin('/admin/usuarios')).text()).includes('Accesos del equipo'))
    const studentResponse=await one('/api/estudiantes',json('POST',{nombre:'QA',apellido1:'Sintetico',fechaNac:'2018-01-01',grado:'3º de Primaria',unidadEducativa:'QA local',gestion:2026,docente:'QA',sexo:'F'}))
    check('Crear estudiante sintético',studentResponse.status===201)
    const student=await studentResponse.json()
    const create=await one('/api/evaluaciones',json('POST',{estudianteId:student.id,evaluador:'QA'}))
    check('Guardar evaluación parcial',create.status===201)
    const ev=await create.json()
    check('Sin valores positivos por defecto',ev.dict_caligUnif==='' && ev.dict_invierte==='')
    check('Estado parcial persistido',ev.estadoAprendizaje==='evaluacion-incompleta')
    check('Registro nuevo no confirma aplicación por defecto',ev.cognitivoAplicado===false&&ev.lexicoAplicado===false)
    const untestedHtml=await (await one('/evaluaciones/'+ev.id)).text()
    check('Registro sin aplicación no presenta dificultades confirmadas',!untestedHtml.includes('Presenta dificultades')&&!untestedHtml.includes('Áreas con dificultad:'))
    check('Otro docente no lee la evaluación',(await two('/api/evaluaciones/'+ev.id)).status===403)
    const forbidden=await two('/evaluaciones/'+ev.id+'/editar')
    const forbiddenHtml=await forbidden.text()
    check('Página de edición no filtra datos ajenos',!forbiddenHtml.includes(student.codigo) && !forbiddenHtml.includes('Editar Evaluación'))
    check('Otro docente no edita la evaluación',(await two('/api/evaluaciones/'+ev.id,json('PUT',{observaciones:'No autorizado'}))).status===403)
    const editHtml=await (await one('/evaluaciones/'+ev.id+'/editar')).text()
    check('Dueño puede abrir edición',editHtml.includes('Editar Evaluación'))
    const complete={...ev,cognitivoAplicado:true,lexicoAplicado:true}
    delete complete.analysisJobs
    for(const k of Object.keys(complete)) {
      if(k.startsWith('ej') && typeof complete[k]==='boolean') complete[k]=true
      if(/^(dict|comp)_/.test(k)) complete[k]=/_(calig|coh|prod)/.test(k)?'B':'N'
    }
    for(const k of ['compMemoriza','compIdeas','compValora','compInterpreta','compAsocia']) complete[k]='S'
    const completed=await one('/api/evaluaciones/'+ev.id,json('PUT',complete))
    check('Actualizar con evaluación completa',completed.status===200)
    check('Puntaje completo sin dificultad',(await completed.json()).estadoAprendizaje==='sin-dificultades')
    check('Confirmación textual rechazada',(await one('/api/evaluaciones/'+ev.id,json('PUT',{cognitivoAplicado:'true'}))).status===400)
    const changedAnswer=await (await one('/api/evaluaciones/'+ev.id,json('PUT',{ej3a1:false}))).json()
    check('Editar respuestas exige reconfirmar aplicación',changedAnswer.cognitivoAplicado===false&&changedAnswer.estadoAprendizaje==='evaluacion-incompleta')
    await one('/api/evaluaciones/'+ev.id,json('PUT',{ej3a1:true,cognitivoAplicado:true}))
    const partialPut=await one('/api/evaluaciones/'+ev.id,json('PUT',{observaciones:'Edición de una sola observación'}))
    check('PUT parcial conserva puntuaciones',(await partialPut.json()).scoreCognitivo===27)
    const aiResponse=await one('/api/evaluaciones/'+ev.id+'/analisis',{method:'POST'})
    check('Generación con proveedor simulado',aiResponse.status===200)
    const afterAI=await (await one('/api/evaluaciones/'+ev.id)).json()
    check('IA no reemplaza clasificación del instrumento',afterAI.estadoAprendizaje==='sin-dificultades' && JSON.parse(afterAI.analisisIA).perfilDAE.nivelDificultad==='sin-dificultades' && JSON.parse(afterAI.analisisIA).controlCalidad.version===1)
    const cached=await (await one('/api/evaluaciones/'+ev.id+'/analisis',{method:'POST'})).json()
    check('Informe vigente se reutiliza sin llamar al proveedor',cached.cached===true && cached.analisis.controlCalidad.version===1)
    hold=true
    const incoming=new Promise(resolve=>{arrived=resolve})
    const racing=one('/api/evaluaciones/'+ev.id+'/analisis',json('POST',{regenerar:true}))
    await Promise.race([incoming,new Promise((_,reject)=>setTimeout(()=>reject(new Error('No llegó solicitud IA')),15000))])
    const sharedJob=await (await one('/api/evaluaciones/'+ev.id+'/analisis',json('POST',{regenerar:true}))).json()
    check('Solicitud simultánea comparte trabajo activo',sharedJob.queued===true && typeof sharedJob.jobId==='string')
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
    // Public registration -> bounded trial -> request inbox -> administrator activation.
    const trialEmail='trial@qa.invalid'
    const registration={nombre:'Cliente QA',email:trialEmail,password,aceptaTerminos:true}
    const publicPost=(route,body)=>fetch(base+route,json('POST',body))
    check('Registro público disponible',(await fetch(base+'/registro')).status===200)
    check('Registro rechaza rol inyectado',(await publicPost('/api/registro',{...registration,rol:'ADMIN'})).status===400)
    check('Registro exige consentimiento',(await publicPost('/api/registro',{...registration,aceptaTerminos:false})).status===400)
    check('Registro rechaza contraseña corta',(await publicPost('/api/registro',{...registration,password:'123'})).status===400)
    check('Crear cuenta pública en prueba',(await publicPost('/api/registro',registration)).status===201)
    check('Correo duplicado no crea otra cuenta',(await publicPost('/api/registro',registration)).status===409)
    const trial=await login(trialEmail)
    const trialSession=await (await trial('/api/auth/session')).json()
    check('Nueva cuenta es docente',trialSession.user.role==='DOCENTE')
    const access=await db.execute({sql:'SELECT estado FROM AccesoComercial WHERE usuarioId=?',args:[trialSession.user.id]})
    check('Plan de prueba persistido',access.rows[0].estado==='PRUEBA')
    await waitFor(async()=>{const r=await db.execute({sql:'SELECT estado,intentos FROM AvisoSistema WHERE id=?',args:['registro-'+trialSession.user.id]});return r.rows[0]?.estado==='PENDIENTE'&&r.rows[0]?.intentos>0})
    const queuedMail=await db.execute({sql:'SELECT estado FROM AvisoSistema WHERE id=?',args:['registro-'+trialSession.user.id]})
    check('Fallo de correo conserva aviso y registro',queuedMail.rows[0].estado==='PENDIENTE')
    check('Cron de correo rechaza anónimo',(await fetch(base+'/api/cron/notificaciones')).status===401)
    check('Docente no puede vaciar cola de correo',(await trial('/api/cron/notificaciones',{method:'POST'})).status===403)
    mailMode='ok'
    const retryMail=await (await admin('/api/cron/notificaciones',{method:'POST'})).json()
    check('Administrador reintenta aviso pendiente',retryMail.sent===1)
    check('Aviso solo al correo de Fernando',mails.length===1 && mails[0].payload.to[0]==='fcalderon@vir-ia.com' && !JSON.stringify(mails).includes(password))

    check('No expone instituciones de clientes',(await (await trial('/api/organizaciones/ue')).json()).length===0)
    check('No accede a datos de otro docente',(await trial('/api/evaluaciones/'+ev.id)).status===403)
    const trialStudentPayload={nombre:'Ficticio',apellido1:'Prueba',fechaNac:'2018-01-01',grado:'3º de Primaria',unidadEducativa:'QA prueba',gestion:2026,docente:'QA',sexo:'F'}
    const studentsRace=await Promise.all([trial('/api/estudiantes',json('POST',trialStudentPayload)),trial('/api/estudiantes',json('POST',trialStudentPayload))])
    check('Cupo de estudiante resiste concurrencia',studentsRace.filter(r=>r.status===201).length===1 && studentsRace.filter(r=>r.status===403).length===1)
    const ts=await studentsRace.find(r=>r.status===201).json()
    const evalPayload={estudianteId:ts.id,evaluador:'QA prueba'}
    const evalRace=await Promise.all([trial('/api/evaluaciones',json('POST',evalPayload)),trial('/api/evaluaciones',json('POST',evalPayload))])
    check('Cupo de evaluación resiste concurrencia',evalRace.filter(r=>r.status===201).length===1 && evalRace.filter(r=>r.status===403).length===1)
    const te=await evalRace.find(r=>r.status===201).json()
    check('Prueba permite editar evaluación',(await trial('/api/evaluaciones/'+te.id,json('PUT',{observaciones:'Avance guardado'}))).status===200)
    // Simulate a pre-existing administrator-generated report: none of it may leak to trial.
    const hidden='INFORME_RESERVADO_QA'
    await db.execute({sql:'UPDATE Evaluacion SET analisisIA=? WHERE id=?',args:[JSON.stringify({fortalezas:[hidden]}),te.id]})
    for(const route of ['/api/evaluaciones','/api/evaluaciones/'+te.id,'/evaluaciones/'+te.id,'/estudiantes/'+ts.id,'/evaluaciones/'+te.id+'/editar']) {
      const response=await trial(route)
      check('Sin informe reservado en '+route,response.status===200 && !(await response.text()).includes(hidden))
    }
    check('Resumen real de prueba visible',(await (await trial('/evaluaciones/'+te.id)).text()).includes('Resumen de la evaluación'))
    for(const [method,route] of [['POST','/analisis'],['GET','/analisis'],['GET','/analisis/status']]) {
      check('Prueba bloquea IA '+method+route,(await trial('/api/evaluaciones/'+te.id+route,{method})).status===403)
    }
    const familyResponse=await trial('/evaluaciones/'+te.id+'/padres')
    const familyHtml=await familyResponse.text()
    check('Vista de familia exige suscripción',(familyResponse.status===307 || familyHtml.includes('NEXT_REDIRECT')) && !familyHtml.includes(hidden))
    check('Usuario no se activa a sí mismo',(await trial('/api/admin/suscripciones/'+trialSession.user.id,{method:'POST'})).status===403)
    const requestPayload={telefono:'+591 70000000',organizacion:'Centro ficticio',mensaje:'Solicitud QA',aceptaContacto:true}
    check('Solicitud exige autorización de contacto',(await trial('/api/suscripcion',json('POST',{...requestPayload,aceptaContacto:false}))).status===400)
    check('Guardar solicitud automática',(await trial('/api/suscripcion',json('POST',requestPayload))).status===200)
    const repeat=await (await trial('/api/suscripcion',json('POST',requestPayload))).json()
    check('Solicitud repetida no duplica',repeat.alreadyRequested===true)
    await waitFor(()=>mails.some(m=>m.payload.subject.includes('Solicitud de suscripción')))
    check('Una notificación de solicitud, sin duplicados',mails.filter(m=>m.payload.subject.includes('Solicitud de suscripción')).length===1)
    const adminHtml=await (await admin('/admin/solicitudes')).text()
    check('Solicitud llega a administración',adminHtml.includes(trialEmail)&&adminHtml.includes('Solicitud QA'))
    check('Solicitar no activa el plan',(await trial('/api/evaluaciones/'+te.id+'/analisis',{method:'POST'})).status===403)
    await trial('/api/evaluaciones/'+te.id,{method:'DELETE'})
    check('Eliminar evaluación no renueva cupo',(await trial('/api/evaluaciones',json('POST',evalPayload))).status===403)
    await trial('/api/estudiantes/'+ts.id,{method:'DELETE'})
    check('Eliminar estudiante no renueva cupo',(await trial('/api/estudiantes',json('POST',trialStudentPayload))).status===403)
    check('Administrador habilita acceso acordado',(await admin('/api/admin/suscripciones/'+trialSession.user.id,{method:'POST'})).status===200)
    const activeStudentResponse=await trial('/api/estudiantes',json('POST',trialStudentPayload))
    check('Activación amplía acceso sin cerrar sesión',activeStudentResponse.status===201)
    const activeStudent=await activeStudentResponse.json()
    const activeEval=await (await trial('/api/evaluaciones',json('POST',{...evalPayload,estudianteId:activeStudent.id}))).json()
    check('Acceso completo habilita IA',(await trial('/api/evaluaciones/'+activeEval.id+'/analisis',{method:'POST'})).status===200)
    await waitFor(()=>mails.some(m=>m.payload.subject.includes('Acceso completo habilitado')))
    check('Aviso de activación enviado',mails.filter(m=>m.payload.subject.includes('Acceso completo habilitado')).length===1)
    check('Acceso completo habilita informe familiar',(await trial('/evaluaciones/'+activeEval.id+'/padres')).status===200)
    for(let i=0;i<3;i++) await publicPost('/api/registro',registration)
    check('Registro público limita abuso',(await publicPost('/api/registro',registration)).status===429)
    // Password recovery, current-password changes, and session revocation.
    check('Página de recuperación disponible',(await fetch(base+'/olvide-contrasena')).status===200)
    check('Página de nueva contraseña disponible',(await fetch(base+'/restablecer-contrasena')).status===200)
    check('Icono propio SVG disponible',(await fetch(base+'/icon.svg')).status===200)
    check('Mi cuenta exige sesión',(await fetch(base+'/cuenta',{redirect:'manual'})).status===307)
    const secondOne=await login('one@qa.invalid')
    const known=await publicPost('/api/auth/recuperar',{email:'one@qa.invalid'})
    const unknown=await publicPost('/api/auth/recuperar',{email:'missing@qa.invalid'})
    check('Recuperación no revela existencia del correo',known.status===202&&unknown.status===202&&JSON.stringify(await known.json())===JSON.stringify(await unknown.json()))
    await waitFor(()=>mails.some(m=>m.payload.subject.includes('Recupera tu acceso')))
    const recoveryMails=()=>mails.filter(m=>m.payload.subject.includes('Recupera tu acceso'))
    const extract=m=>m.payload.text.match(/#token=([a-f0-9]{64})/)[1]
    const firstToken=extract(recoveryMails()[0])
    const oneId=(await (await one('/api/auth/session')).json()).user.id
    const stored=await db.execute({sql:'SELECT tokenHash FROM RecuperacionPassword WHERE usuarioId=?',args:[oneId]})
    check('Token solo en correo del titular, almacenado como hash',recoveryMails()[0].payload.to[0]==='one@qa.invalid'&&stored.rows[0].tokenHash!==firstToken)
    const newPassword=randomBytes(18).toString('hex')
    const resetBody=token=>({token,password:newPassword,confirmPassword:newPassword})
    check('Token inventado rechazado',(await publicPost('/api/auth/restablecer',resetBody('a'.repeat(64)))).status===400)
    check('Confirmación diferente rechazada',(await publicPost('/api/auth/restablecer',{...resetBody(firstToken),confirmPassword:'distinta'})).status===400)
    await db.execute({sql:'UPDATE RecuperacionPassword SET venceEn=? WHERE usuarioId=?',args:[Date.now()-60000,oneId]})
    check('Token vencido rechazado',(await publicPost('/api/auth/restablecer',resetBody(firstToken))).status===400)
    await publicPost('/api/auth/recuperar',{email:'one@qa.invalid'})
    await waitFor(()=>recoveryMails().length===2)
    const validToken=extract(recoveryMails()[1])
    const resetRace=await Promise.all([publicPost('/api/auth/restablecer',resetBody(validToken)),publicPost('/api/auth/restablecer',resetBody(validToken))])
    check('Enlace de un uso bajo concurrencia',resetRace.filter(r=>r.status===200).length===1&&resetRace.filter(r=>r.status===400).length===1)
    check('Token usado no se puede reutilizar',(await publicPost('/api/auth/restablecer',resetBody(validToken))).status===400)
    check('Recuperación revoca todas las sesiones anteriores',(await one('/api/estudiantes')).status===401&&(await secondOne('/api/estudiantes')).status===401)
    await login('one@qa.invalid',password,false)
    const newOne=await login('one@qa.invalid',newPassword)
    check('Mi cuenta disponible con la contraseña nueva',(await (await newOne('/cuenta')).text()).includes('Cambiar contraseña'))
    const changedPassword=randomBytes(18).toString('hex')
    check('Cambio exige clave actual correcta',(await newOne('/api/cuenta/password',json('POST',{currentPassword:'incorrecta',password:changedPassword,confirmPassword:changedPassword}))).status===400)
    check('Cambio voluntario de contraseña',(await newOne('/api/cuenta/password',json('POST',{currentPassword:newPassword,password:changedPassword,confirmPassword:changedPassword}))).status===200)
    check('Cambio voluntario revoca la sesión',(await newOne('/api/estudiantes')).status===401)
    await login('one@qa.invalid',changedPassword)
    const twoId=(await (await two('/api/auth/session')).json()).user.id
    await admin('/api/admin/usuarios/'+twoId,json('PATCH',{activo:false}))
    check('Desactivación revoca sesiones existentes',(await two('/api/estudiantes')).status===401)
    await admin('/api/admin/usuarios/'+twoId,json('PATCH',{activo:true}))
    check('Reactivar no revive cookies revocadas',(await two('/api/estudiantes')).status===401)
    const notices=await db.execute('SELECT texto FROM AvisoSistema')
    check('Avisos no contienen contraseñas ni tokens',notices.rows.every(r=>![firstToken,validToken,newPassword,changedPassword].some(secret=>r.texto.includes(secret))))
    // Existing user records and trial limits were exercised above; paging must be bounded.
    const pagingUserId=(await (await admin('/api/auth/session')).json()).user.id
    const insert='INSERT INTO Estudiante (id,codigo,nombre,apellido1,fechaNac,grado,unidadEducativa,gestion,docente,sexo,docenteId,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
    for(let i=0;i<26;i++) await db.execute({sql:insert,args:[randomUUID(),'PAGE-'+i,'QA','Paging',Date.now(),'3º de Primaria','QA',2026,'QA','F',pagingUserId,Date.now(),Date.now()]})
    const page1=await (await admin('/estudiantes?q=PAGE-')).text()
    const page2=await (await admin('/estudiantes?q=PAGE-&pagina=2')).text()
    check('Listado paginado conserva búsqueda',page1.includes('Página <!-- -->1<!-- --> de <!-- -->2')&&page2.includes('Página <!-- -->2<!-- --> de <!-- -->2'))
    // Families: genuine public signup, independent ownership, deterministic orientation.
    await db.execute('DELETE FROM RegistroVentana')
    check('Página pública para familias',(await fetch(base+'/familias')).status===200)
    for(const email of ['family1@qa.invalid','family2@qa.invalid']) check('Crear cuenta familiar '+email,(await publicPost('/api/registro',{nombre:'Familia QA',email,password,perfil:'FAMILIA',aceptaTerminos:true})).status===201)
    check('Perfil administrativo inyectado rechazado',(await publicPost('/api/registro',{nombre:'QA',email:'bad@qa.invalid',password,perfil:'ADMIN',aceptaTerminos:true})).status===400)
    const family1=await login('family1@qa.invalid'),family2=await login('family2@qa.invalid')
    const familyUser=(await (await family1('/api/auth/session')).json()).user
    check('Sesión familiar conserva rol',familyUser.role==='FAMILIA')
    check('Familia entra a su espacio',(await (await family1('/familia')).text()).includes('Acompaña su aprendizaje en casa'))
    check('Dashboard redirige a familia',(await family1('/dashboard')).headers.get('location')?.endsWith('/familia'))
    for(const path of ['/api/estudiantes','/api/evaluaciones','/api/dashboard','/api/organizaciones/ue','/api/admin/usuarios']) check('Familia no accede al área profesional '+path,(await family1(path)).status===403)
    check('Familia no puede crear evaluación profesional',(await family1('/api/evaluaciones',json('POST',{estudianteId:student.id}))).status===403)
    const observation={id:randomUUID(),alias:'FAMILIA-PRIVADA-QA',edad:8,respuestas:{lectura:'no_observado',comprension:'autonomo',escritura:'a_veces',instrucciones:'frecuente',bienestar:'autonomo',rutina:'no_observado'},autoriza:true}
    check('Familia exige autorización',(await family1('/api/familia',json('POST',{...observation,autoriza:false}))).status===400)
    check('Respuesta familiar inexistente rechazada',(await family1('/api/familia',json('POST',{...observation,respuestas:{...observation.respuestas,lectura:'diagnostico'}}))).status===400)
    check('Edad fuera del alcance rechazada',(await family1('/api/familia',json('POST',{...observation,edad:3}))).status===400)
    check('Familia no abre instrumento profesional', (await family1('/api/instrumento/original.pdf')).status===403)
    check('Docente no presenta observación como familia',(await admin('/api/familia',json('POST',observation))).status===403)
    const candidates=[observation,{...observation,id:randomUUID()}]
    const familyRace=await Promise.all(candidates.map(o=>family1('/api/familia',json('POST',o))))
    check('Cupo familiar resiste concurrencia',familyRace.filter(r=>r.status===200).length===1&&familyRace.filter(r=>r.status===403).length===1)
    let saved=candidates[familyRace.findIndex(r=>r.status===200)]
    check('Familia puede editar sin consumir otro cupo',(await family1('/api/familia',json('POST',saved))).status===200)
    const parentSpaceHtml=await (await family1('/familia/'+saved.id)).text()
    check('Resumen familiar sin diagnóstico y con áreas no observadas',parentSpaceHtml.includes('no un diagnóstico')&&parentSpaceHtml.includes('Sin observación suficiente')&&parentSpaceHtml.includes('FAMILIA-PRIVADA-QA'))
    check('Otra familia no lee el registro',!(await (await family2('/familia/'+saved.id)).text()).includes('FAMILIA-PRIVADA-QA'))
    check('Otra familia no edita el registro',(await family2('/api/familia',json('POST',saved))).status===403)
    check('Otra familia no elimina el registro',(await family2('/api/familia?id='+saved.id,{method:'DELETE'})).status===404)
    check('Prueba familiar ofrece ampliar su propio alcance',(await (await family1('/suscripcion')).text()).includes('no habilita pruebas profesionales'))
    const familyNotice=await db.execute({sql:'SELECT texto FROM AvisoSistema WHERE id=?',args:['familia-'+saved.id]})
    check('Aviso familiar no contiene respuestas ni apodo',familyNotice.rows.length===1&&!familyNotice.rows[0].texto.includes(saved.alias)&&!familyNotice.rows[0].texto.includes('no_observado'))
    check('Familia elimina su propio registro',(await family1('/api/familia?id='+saved.id,{method:'DELETE'})).status===200)
    check('Eliminar no renueva prueba familiar',(await family1('/api/familia',json('POST',{...saved,id:randomUUID()}))).status===403)
    check('Familia solicita ampliación',(await family1('/api/suscripcion',json('POST',requestPayload))).status===200)
    check('Administración activa solicitud familiar',(await admin('/api/admin/suscripciones/'+familyUser.id,{method:'POST'})).status===200)
    saved={...saved,id:randomUUID()}
    check('Acceso familiar ampliado permite otro registro',(await family1('/api/familia',json('POST',saved))).status===200)
    check('Activar familia no habilita área docente',(await family1('/api/evaluaciones')).status===403)
    writeFileSync(path.join(dir,'resultados.json'),JSON.stringify({passed,productionAccess:false,ai:'local fake'},null,2))
    console.log(`${passed.length} comprobaciones correctas. Evidencia: ${dir}`)
    if(process.env.QA_KEEP_SERVER==='1') {
      writeFileSync(path.join(dir,'browser-qa.json'),JSON.stringify({base,email:'family1@qa.invalid',password,href:'/familia/'+saved.id}),{mode:0o600})
      console.log('Servidor de inspección visual disponible; solo datos sintéticos: '+dir)
      await new Promise(resolve=>process.once('SIGINT',resolve))
    }
  } finally {
    server.kill('SIGTERM'); ai.close(); db.close(); closeSync(log)
  }
}
main().catch(e=>{console.error(e);process.exitCode=1})
