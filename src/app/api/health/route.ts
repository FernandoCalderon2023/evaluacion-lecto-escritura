import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { emailConfigured } from "@/lib/notifications"
export const dynamic="force-dynamic"
export const maxDuration=10
const startTime=Date.now()
export async function GET(){
 const checks={database:{ok:false,latencyMs:0},ai:{configured:!!(process.env.DEEPSEEK_API_KEY?.trim()||process.env.ANTHROPIC_API_KEY?.trim())},auth:{configured:!!process.env.NEXTAUTH_SECRET?.trim()},email:{configured:emailConfigured()}}
 const began=Date.now()
 try{await prisma.$queryRaw`SELECT 1`;checks.database.ok=true}catch{ /* Do not expose connection strings or driver errors publicly. */ }
 checks.database.latencyMs=Date.now()-began
 const status=!checks.database.ok?"down":checks.ai.configured&&checks.auth.configured&&checks.email.configured?"ok":"degraded"
 return NextResponse.json({status,timestamp:new Date().toISOString(),uptime:Math.floor((Date.now()-startTime)/1000),version:process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7)??"dev",checks},{status:checks.database.ok?200:503,headers:{"Cache-Control":"no-store"}})
}
