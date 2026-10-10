"use client"
import { usePathname } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
export function Telemetry(){const path=usePathname();if(path==="/restablecer-contrasena" || path==="/olvide-contrasena")return null;return <><Analytics/><SpeedInsights/></>}
