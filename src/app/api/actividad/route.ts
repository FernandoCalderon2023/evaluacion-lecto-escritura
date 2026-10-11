import { NextResponse } from "next/server"
import { getAuthContext, unauthorizedResponse } from "@/lib/apiAuth"
import { prisma } from "@/lib/prisma"
export async function POST(){
 const auth=await getAuthContext();if(!auth)return unauthorizedResponse()
 await prisma.usuario.updateMany({where:{id:auth.userId,activo:true,OR:[{lastSeenAt:null},{lastSeenAt:{lt:new Date(Date.now()-60000)}}]},data:{lastSeenAt:new Date()}})
 return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}})
}
