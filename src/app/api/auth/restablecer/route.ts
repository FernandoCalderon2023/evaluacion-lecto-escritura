import { NextRequest, NextResponse } from "next/server"
import { waitUntil } from "@vercel/functions"
import { z } from "zod"
import { randomUUID } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { passwordSchema, hashResetToken, hashPassword, allowSecurityRequest, passwordChangedNotices } from "@/lib/accountSecurity"
import { getClientIp } from "@/lib/ratelimit"
import { sendNotice } from "@/lib/notifications"
const schema=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),password:passwordSchema,confirmPassword:z.string()}).strict().refine(v=>v.password===v.confirmPassword)
export async function POST(req:NextRequest){
 const parsed=schema.safeParse(await req.json().catch(()=>null))
 if(!parsed.success)return NextResponse.json({error:"Revisa el enlace y usa dos contraseñas iguales, de al menos 10 caracteres."},{status:400})
 try{
  if(!await allowSecurityRequest("reset-ip",getClientIp(req),15))return NextResponse.json({error:"Demasiados intentos. Intenta más tarde."},{status:429})
  const tokenHash=hashResetToken(parsed.data.token)
  const record=await prisma.recuperacionPassword.findUnique({where:{tokenHash},include:{usuario:{select:{activo:true}}}})
  if(!record || record.usadoEn || record.venceEn<=new Date() || !record.usuario.activo)return NextResponse.json({error:"El enlace ya fue usado o venció. Solicita uno nuevo."},{status:400})
  const passwordHash=await hashPassword(parsed.data.password),eventId=randomUUID()
  await prisma.$transaction(async tx=>{
    const used=await tx.recuperacionPassword.updateMany({where:{tokenHash,usadoEn:null,venceEn:{gt:new Date()},usuario:{activo:true}},data:{usadoEn:new Date()}})
    if(!used.count)throw new Error("INVALID_TOKEN")
    await tx.usuario.update({where:{id:record.usuarioId},data:{passwordHash,sessionVersion:{increment:1}}})
    await passwordChangedNotices(tx,record.usuarioId,eventId)
  })
  waitUntil(Promise.all([sendNotice(`seguridad-usuario-${eventId}`),sendNotice(`seguridad-admin-${eventId}`)]))
  return NextResponse.json({ok:true})
 }catch(e){return NextResponse.json({error:e instanceof Error && e.message==="INVALID_TOKEN"?"El enlace ya fue usado o venció.":"No se pudo cambiar la contraseña. Intenta nuevamente."},{status:e instanceof Error && e.message==="INVALID_TOKEN"?400:503})}
}
