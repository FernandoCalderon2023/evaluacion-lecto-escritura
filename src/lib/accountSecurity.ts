import { createHash, createHmac, randomBytes } from "node:crypto"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { deliverEmail, queueNotice } from "@/lib/notifications"
import { logAuditSync } from "@/lib/audit"

export const passwordSchema = z.string().min(10).max(72).refine(v => Buffer.byteLength(v,"utf8") <= 72)
export const hashResetToken = (token:string) => createHash("sha256").update(token).digest("hex")
export async function allowSecurityRequest(scope:string, identity:string, limit:number) {
  const key=createHmac("sha256",process.env.NEXTAUTH_SECRET!).update(`${scope}:${identity}:${Math.floor(Date.now()/3600000)}`).digest("hex")
  const row=await prisma.registroVentana.upsert({where:{id:key},create:{id:key},update:{intentos:{increment:1}}})
  return row.intentos<=limit
}
export async function requestPasswordReset(email:string) {
  try {
    const user=await prisma.usuario.findUnique({where:{email},select:{id:true,email:true,activo:true}})
    if(!user?.activo)return
    const token=randomBytes(32).toString("hex"), tokenHash=hashResetToken(token)
    await prisma.recuperacionPassword.create({data:{tokenHash,usuarioId:user.id,venceEn:new Date(Date.now()+30*60000)}})
    // Fragment keeps the secret out of HTTP URLs, access logs and referrers.
    const url=`https://sideda.com/restablecer-contrasena#token=${token}`
    const sent=await deliverEmail(`recuperacion-${tokenHash}`,user.email,"SIDEDA · Recupera tu acceso",`Solicitaste restablecer tu contraseña. Abre este enlace de un solo uso, válido por 30 minutos:\n\n${url}\n\nSi no hiciste esta solicitud, puedes ignorarla. Tu contraseña todavía no ha cambiado. No compartas este enlace.`)
    if(!sent) await prisma.recuperacionPassword.updateMany({where:{tokenHash,usadoEn:null},data:{usadoEn:new Date()}})
    await logAuditSync({actorId:user.id,action:sent?"password_reset_email_accepted":"password_reset_email_failed"})
  } catch { console.error("[recovery] No se pudo procesar la solicitud de recuperación") }
}
export async function passwordChangedNotices(tx:Prisma.TransactionClient, userId:string, eventId:string) {
  const user=await tx.usuario.findUniqueOrThrow({where:{id:userId},select:{email:true}})
  await tx.recuperacionPassword.updateMany({where:{usuarioId:userId,usadoEn:null},data:{usadoEn:new Date()}})
  await tx.avisoSistema.create({data:{id:`seguridad-usuario-${eventId}`,destinatario:user.email,asunto:"SIDEDA · Contraseña actualizada",texto:"La contraseña de tu cuenta fue actualizada y las sesiones anteriores quedaron cerradas. Si no realizaste este cambio, contacta a fcalderon@vir-ia.com. No compartas tu contraseña ni enlaces de recuperación."}})
  await queueNotice(tx,`seguridad-admin-${eventId}`,"Contraseña restablecida",[`Cuenta: ${user.email}`,"Se actualizó la contraseña y se revocaron las sesiones anteriores. No se incluyen contraseñas ni enlaces de acceso."])
}
export const hashPassword = (password:string) => bcrypt.hash(password,12)
