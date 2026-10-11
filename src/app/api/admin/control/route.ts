import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/apiAuth"
import { getAIControl, expireAnalysisJobs } from "@/lib/ai/capacity"
import { emailConfigured } from "@/lib/notifications"
import { allowSecurityRequest, requestPasswordReset } from "@/lib/accountSecurity"
export const dynamic = "force-dynamic"
export const maxDuration = 30
const securityActions = ["password_changed", "password_reset_completed"]
export async function GET(req: NextRequest) {
 const gate = await requireAdmin(); if (!gate.ok) return gate.response
 try {
  const url = new URL(req.url), days = Number(url.searchParams.get("days") || 7)
  if (![1,7,30].includes(days)) return NextResponse.json({error:"Periodo inválido"},{status:400})
  const page = Math.max(1, Math.min(1000, Number(url.searchParams.get("page")) || 1))
  if (!Number.isInteger(page)) return NextResponse.json({error:"Página inválida"},{status:400})
  const eventPage=Math.max(1,Math.min(1000,Number(url.searchParams.get("eventPage"))||1))
  if(!Number.isInteger(eventPage))return NextResponse.json({error:"Página inválida"},{status:400})
  const query = (url.searchParams.get("q") || "").trim().slice(0,80)
  const since = new Date(Date.now()-days*86400000), recent = new Date(Date.now()-5*60000)
  const began = Date.now(); await prisma.$queryRaw`SELECT 1`; const databaseMs = Date.now()-began
  const whereUsers = query ? {OR:[{email:{contains:query}},{nombre:{contains:query}}]} : {}
  const [control,total,enabled,roles,recentUsers,students,evaluations,families,notices,requests,loginEvents,uniqueLogins,changes,changedUsers,failedLogins,jobs,activeJobs,durations,users,userCount,events,eventCount] = await Promise.all([
   getAIControl(), prisma.usuario.count(), prisma.usuario.count({where:{activo:true}}), prisma.usuario.groupBy({by:["rol"],_count:true}),
   prisma.usuario.count({where:{activo:true,lastSeenAt:{gte:recent}}}), prisma.estudiante.count(),prisma.evaluacion.count(),prisma.observacionFamiliar.count(),
   prisma.avisoSistema.count({where:{estado:{not:"ENVIADO"}}}),prisma.accesoComercial.count({where:{estado:"PRUEBA",solicitadoEn:{not:null}}}),
   prisma.auditLog.count({where:{action:"login_success",createdAt:{gte:since}}}),prisma.auditLog.groupBy({by:["actorId"],where:{action:"login_success",actorId:{not:null},createdAt:{gte:since}}}),
   prisma.auditLog.count({where:{action:{in:securityActions},createdAt:{gte:since}}}),prisma.auditLog.groupBy({by:["actorId"],where:{action:{in:securityActions},actorId:{not:null},createdAt:{gte:since}}}),
   prisma.auditLog.count({where:{action:{startsWith:"login_failed"},createdAt:{gte:since}}}),
   prisma.analysisJob.groupBy({by:["status"],where:{createdAt:{gte:since}},_count:true}),
   prisma.analysisJob.findMany({where:{status:{in:["queued","processing"]}},orderBy:{createdAt:"asc"},take:50,select:{id:true,evaluacionId:true,docenteId:true,status:true,createdAt:true,startedAt:true,updatedAt:true}}),
   prisma.analysisJob.findMany({where:{status:"done",completedAt:{gte:since},startedAt:{not:null}},orderBy:{completedAt:"desc"},take:200,select:{startedAt:true,completedAt:true}}),
   prisma.usuario.findMany({where:whereUsers,orderBy:{createdAt:"desc"},skip:(page-1)*20,take:20,select:{id:true,nombre:true,email:true,rol:true,activo:true,lastSeenAt:true,lastLoginAt:true}}),
   prisma.usuario.count({where:whereUsers}),
   prisma.auditLog.findMany({where:{createdAt:{gte:since}},orderBy:{createdAt:"desc"},take:30,skip:(eventPage-1)*30,select:{id:true,actorId:true,actorEmail:true,action:true,target:true,createdAt:true}}),
   prisma.auditLog.count({where:{createdAt:{gte:since}}}),
  ])
  const ids=[...new Set([...events.map(e=>e.actorId),...activeJobs.map(j=>j.docenteId)].filter((id):id is string=>!!id))]
  const actors=await prisma.usuario.findMany({where:{id:{in:ids}},select:{id:true,nombre:true,email:true}})
  const actorMap=new Map(actors.map(a=>[a.id,a]))
  const [processing,queued]=await Promise.all([prisma.analysisJob.count({where:{status:"processing"}}),prisma.analysisJob.count({where:{status:"queued"}})])
  const times=durations.map(d=>(d.completedAt!.getTime()-d.startedAt!.getTime())/1000).filter(n=>n>=0).sort((a,b)=>a-b)
  const percentile=(p:number)=>times.length?Math.round(times[Math.min(times.length-1,Math.ceil(times.length*p)-1)]):null
  return NextResponse.json({timestamp:new Date().toISOString(),version:process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7)||"local",days,
   health:{databaseMs,emailConfigured:emailConfigured(),aiConfigured:!!(process.env.DEEPSEEK_API_KEY||process.env.ANTHROPIC_API_KEY),provider:process.env.DEEPSEEK_API_KEY?"DeepSeek":"Anthropic",queueConfigured:!!(process.env.QSTASH_TOKEN&&process.env.QSTASH_CURRENT_SIGNING_KEY)},
   control,counts:{total,enabled,recentUsers,students,evaluations,families,notices,requests,loginEvents,uniqueLogins:uniqueLogins.length,changes,changedUsers:changedUsers.length,failedLogins,processing,queued},roles:roles.map(r=>({role:r.rol,count:r._count})),
   jobs:jobs.map(j=>({status:j.status,count:j._count})),activeJobs:activeJobs.map(j=>({...j,actor:actorMap.get(j.docenteId||"")?.email||"Cuenta no disponible"})),timing:{p50:percentile(.5),p95:percentile(.95),sample:times.length},
   users,userCount,events:events.map(e=>({...e,actor:actorMap.get(e.actorId||"")?.email||e.actorEmail||"Sistema"})),eventCount,page,eventPage,currentUserId:gate.auth.userId,
  },{headers:{"Cache-Control":"private, no-store"}})
 }catch{return NextResponse.json({error:"No se pudo consultar el estado. No se considera una comprobación de salud satisfactoria."},{status:503})}
}
const schema=z.discriminatedUnion("action",[
 z.object({action:z.literal("settings"),revision:z.number().int().min(0),paused:z.boolean(),parallelism:z.number().int().min(1).max(20),perUser:z.number().int().min(1).max(3),hourlyPerUser:z.number().int().min(1).max(100)}).strict(),
 z.object({action:z.literal("expire")}).strict(),
 z.object({action:z.literal("cancelQueued"),jobId:z.string().min(1).max(100)}).strict(),
 z.object({action:z.literal("revokeSessions"),userId:z.string().min(1).max(100)}).strict(),
 z.object({action:z.literal("resetEmail"),userId:z.string().min(1).max(100)}).strict(),
])
export async function POST(req:NextRequest){
 const gate=await requireAdmin();if(!gate.ok)return gate.response
 const parsed=schema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Acción inválida."},{status:400})
 const data=parsed.data
 if(data.action==="settings"&&data.perUser>data.parallelism)return NextResponse.json({error:"El límite por usuario no puede superar el global."},{status:400})
 try {
  if(!await allowSecurityRequest("admin-control",gate.auth.userId,60))return NextResponse.json({error:"Demasiadas acciones. Intenta más tarde."},{status:429})
  if(data.action==="settings"){
   const defaults=await getAIControl()
   await prisma.$transaction(async tx=>{
    await tx.systemControl.upsert({where:{id:"ai"},create:{id:"ai",parallelism:defaults.parallelism,perUser:defaults.perUser,hourlyPerUser:defaults.hourlyPerUser},update:{}})
    const changed=await tx.systemControl.updateMany({where:{id:"ai",revision:data.revision},data:{paused:data.paused,parallelism:data.parallelism,perUser:data.perUser,hourlyPerUser:data.hourlyPerUser,revision:{increment:1},updatedBy:gate.auth.userId}})
    if(!changed.count)throw new Error("CONFLICT")
    await tx.auditLog.create({data:{actorId:gate.auth.userId,action:"admin_ai_settings",target:"ai",metadata:JSON.stringify({before:defaults,after:data})}})
   })
  }else if(data.action==="expire"){
   await expireAnalysisJobs()
   await prisma.auditLog.create({data:{actorId:gate.auth.userId,action:"admin_expire_jobs"}})
  }else if(data.action==="cancelQueued"){
   await prisma.$transaction(async tx=>{
    const result=await tx.analysisJob.updateMany({where:{id:data.jobId,status:"queued"},data:{status:"failed",activeKey:null,error:"Solicitud cancelada por administración. Puedes solicitar un nuevo informe.",completedAt:new Date()}})
    if(!result.count)throw new Error("CONFLICT")
    await tx.auditLog.create({data:{actorId:gate.auth.userId,action:"admin_cancel_queued",target:data.jobId}})
   })
  }else{
   if(data.userId===gate.auth.userId)return NextResponse.json({error:"Para tu propia cuenta usa Mi cuenta."},{status:400})
   const user=await prisma.usuario.findUnique({where:{id:data.userId},select:{id:true,email:true,activo:true}})
   if(!user)return NextResponse.json({error:"Cuenta no encontrada."},{status:404})
   if(data.action==="revokeSessions")await prisma.$transaction([
    prisma.usuario.update({where:{id:user.id},data:{sessionVersion:{increment:1},lastSeenAt:null}}),
    prisma.auditLog.create({data:{actorId:gate.auth.userId,action:"admin_revoke_sessions",target:user.id}}),
   ])
   else{
    if(!user.activo||!emailConfigured())return NextResponse.json({error:"La cuenta debe estar activa y el correo configurado."},{status:409})
    if(!await allowSecurityRequest("admin-reset",user.id,3))return NextResponse.json({error:"Ya se solicitaron varios enlaces para esta cuenta. Espera una hora."},{status:429})
    await requestPasswordReset(user.email)
    await prisma.auditLog.create({data:{actorId:gate.auth.userId,action:"admin_request_reset",target:user.id}})
    return NextResponse.json({ok:true,message:"Solicitud procesada. Revisa la auditoría para comprobar si el proveedor aceptó el envío."})
   }
  }
  return NextResponse.json({ok:true,message:"Acción aplicada y registrada."})
 }catch(error){return NextResponse.json({error:error instanceof Error&&error.message==="CONFLICT"?"El estado cambió. Actualiza el panel antes de repetir la acción.":"No se pudo aplicar la acción. Actualiza el panel para comprobar el estado."},{status:error instanceof Error&&error.message==="CONFLICT"?409:503})}
}
