"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
export function NotificationStatus({configured,pending,sent,email}:{configured:boolean;pending:number;sent:number;email:string}) {
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");const router=useRouter()
 async function retry(){setBusy(true);setMessage("");try{const r=await fetch("/api/cron/notificaciones",{method:"POST"});const d=await r.json();if(!r.ok)throw new Error();setMessage(d.configured?`${d.sent} aviso(s) aceptado(s) por el servicio de correo.`:"Falta conectar el servicio de envío.");router.refresh()}catch{setMessage("No se pudo procesar la cola. Intenta nuevamente.")}finally{setBusy(false)}}
 return <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">Avisos del sistema</h2><p className="mt-2 break-words text-sm text-slate-600">Fernando Calderon · {email}</p><p className="mt-2 text-sm text-slate-500">{pending} pendientes · {sent} aceptados por el servicio de correo</p>{!configured&&<p className="mt-3 text-sm text-amber-800">El envío de correo aún no está conectado. Los avisos permanecen guardados; las solicitudes se pueden consultar abajo.</p>}<button onClick={retry} disabled={busy||!configured} className="mt-3 rounded-lg border px-4 py-2 text-sm disabled:opacity-40">{busy?"Procesando…":"Reintentar avisos pendientes"}</button>{message&&<p role="status" className="mt-3 text-sm">{message}</p>}</section>
}
