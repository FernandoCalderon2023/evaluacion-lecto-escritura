import { NextRequest, NextResponse } from "next/server"
import { waitUntil } from "@vercel/functions"
import { randomUUID } from "node:crypto"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getAuthContext, unauthorizedResponse } from "@/lib/apiAuth"
import { passwordSchema, hashPassword, allowSecurityRequest, passwordChangedNotices } from "@/lib/accountSecurity"
import { sendNotice } from "@/lib/notifications"
const schema=z.object({currentPassword:z.string().min(1).max(200),password:passwordSchema,confirmPassword:z.string()}).strict().refine(v=>v.password===v.confirmPassword && v.currentPassword!==v.password)
export async function POST(req:NextRequest){
 const auth=await getAuthContext();if(!auth)return unauthorizedResponse()
 const parsed=schema.safeParse(await req.json().catch(()=>null))
 if(!parsed.success)return NextResponse.json({error:"La contraseña nueva debe ser diferente, tener al menos 10 caracteres y coincidir con la confirmación."},{status:400})
 try{
  if(!await allowSecurityRequest("change-password",auth.userId,5))return NextResponse.json({error:"Demasiados intentos. Intenta más tarde."},{status:429})
  const user=await prisma.usuario.findUniqueOrThrow({where:{id:auth.userId}})
  if(!await bcrypt.compare(parsed.data.currentPassword,user.passwordHash))return NextResponse.json({error:"La contraseña actual no es correcta."},{status:400})
  const passwordHash=await hashPassword(parsed.data.password),eventId=randomUUID()
  await prisma.$transaction(async tx=>{
    const changed=await tx.usuario.updateMany({where:{id:user.id,activo:true,sessionVersion:user.sessionVersion},data:{passwordHash,sessionVersion:{increment:1}}})
    if(!changed.count)throw new Error("STALE_SESSION")
    await tx.auditLog.create({data:{actorId:user.id,action:"password_changed"}})
    await passwordChangedNotices(tx,user.id,eventId)
  })
  waitUntil(Promise.all([sendNotice(`seguridad-usuario-${eventId}`),sendNotice(`seguridad-admin-${eventId}`)]))
  return NextResponse.json({ok:true})
 }catch{return NextResponse.json({error:"No se pudo cambiar la contraseña. Vuelve a iniciar sesión e intenta nuevamente."},{status:503})}
}
