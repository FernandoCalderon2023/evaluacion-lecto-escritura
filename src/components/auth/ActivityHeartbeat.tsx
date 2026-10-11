"use client"
import { useEffect } from "react"
export function ActivityHeartbeat(){
 useEffect(()=>{
  let running=false
  const ping=async()=>{if(document.visibilityState!=="visible"||running)return;running=true;try{await fetch("/api/actividad",{method:"POST",signal:AbortSignal.timeout(10000)})}catch{}finally{running=false}}
  void ping();const timer=setInterval(ping,90000)
  document.addEventListener("visibilitychange",ping)
  return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",ping)}
 },[])
 return null
}
