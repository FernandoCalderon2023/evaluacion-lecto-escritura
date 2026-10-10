import { NextRequest, NextResponse } from "next/server"
import { flushNotices } from "@/lib/notifications"
import { getAuthContext } from "@/lib/apiAuth"
export const maxDuration = 300
export const dynamic = "force-dynamic"
export async function GET(req: NextRequest) {
  const secret=process.env.CRON_SECRET?.trim()
  if(!secret || req.headers.get("authorization")!==`Bearer ${secret}`) return NextResponse.json({error:"No autorizado"},{status:401})
  return NextResponse.json(await flushNotices())
}
export async function POST() {
  const auth=await getAuthContext()
  if(!auth?.isAdmin) return NextResponse.json({error:"No autorizado"},{status:403})
  return NextResponse.json(await flushNotices())
}
