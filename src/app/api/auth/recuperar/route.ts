import { NextRequest, NextResponse } from "next/server"
import { waitUntil } from "@vercel/functions"
import { z } from "zod"
import { emailConfigured } from "@/lib/notifications"
import { allowSecurityRequest, requestPasswordReset } from "@/lib/accountSecurity"
import { getClientIp } from "@/lib/ratelimit"
export async function POST(req:NextRequest){
 const body=z.object({email:z.string().trim().toLowerCase().email().max(254)}).strict().safeParse(await req.json().catch(()=>null))
 if(!body.success)return NextResponse.json({error:"Indica un correo válido."},{status:400})
 if(!emailConfigured())return NextResponse.json({error:"El envío de correo todavía no está habilitado. Contacta a fcalderon@vir-ia.com para recuperar el acceso.",code:"EMAIL_UNAVAILABLE"},{status:503})
 try {
  const allowed=await allowSecurityRequest("recovery-ip",getClientIp(req),10)
  if(!allowed)return NextResponse.json({error:"Demasiadas solicitudes. Intenta más tarde."},{status:429,headers:{"Retry-After":"3600"}})
  if(await allowSecurityRequest("recovery-email",body.data.email,3)) waitUntil(requestPasswordReset(body.data.email))
  return NextResponse.json({ok:true,message:"Si el correo corresponde a una cuenta activa, recibirás un enlace. Revisa también la carpeta de spam."},{status:202})
 }catch{return NextResponse.json({error:"No pudimos procesar la solicitud. Intenta nuevamente."},{status:503})}
}
