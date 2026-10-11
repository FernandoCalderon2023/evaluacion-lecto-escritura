"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
export function RegisterForm({ family = false }: { family?: boolean }) {
  const [busy,setBusy]=useState(false), [error,setError]=useState("")
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("")
    const data=new FormData(e.currentTarget)
    const email=String(data.get("email")), password=String(data.get("password"))
    try {
      const r=await fetch("/api/registro",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({perfil:data.get("perfil"),nombre:data.get("nombre"),email,password,aceptaTerminos:data.get("aceptaTerminos")==="on"})})
      const result=await r.json()
      if(!r.ok) throw new Error(result.error || "No se pudo crear tu cuenta.")
      const session=await signIn("credentials",{email,password,redirect:false})
      window.location.assign(session?.ok && !session.error ? "/prueba" : "/login?registro=ok")
    } catch(e) { setError(e instanceof Error ? e.message : "No pudimos conectar. Intenta nuevamente.") }
    finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="space-y-5">
    <label className="block text-sm font-semibold">Quiero usar SIDEDA como<select name="perfil" defaultValue={family ? "FAMILIA" : "DOCENTE"} disabled={busy} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3"><option value="DOCENTE">Docente o profesional</option><option value="FAMILIA">Madre, padre o responsable</option></select></label>
    {[["nombre","Tu nombre","text","name"],["email","Correo electrónico","email","email"],["password","Contraseña","password","new-password"]].map(([name,label,type,complete])=><div key={name}><label htmlFor={name} className="mb-2 block text-sm font-semibold">{label}</label><input id={name} name={name} type={type} autoComplete={complete} required minLength={name==="password"?10:undefined} maxLength={name==="password"?72:name==="nombre"?100:254} disabled={busy} className="w-full rounded-xl border border-slate-300 bg-white p-3"/>{name==="password"&&<p className="mt-2 text-xs text-slate-500">Al menos 10 caracteres.</p>}</div>)}
    <label className="flex items-start gap-3 text-xs leading-relaxed text-slate-600"><input name="aceptaTerminos" type="checkbox" required className="mt-1"/> <span>Acepto los <Link href="/terminos" target="_blank" className="underline">términos de uso</Link> y he leído la <Link href="/privacidad" target="_blank" className="underline">política de privacidad</Link>.</span></label>
    {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={busy} className="w-full rounded-xl bg-viria-900 p-3 font-semibold text-white disabled:opacity-50">{busy?"Creando tu cuenta…":"Crear cuenta y probar"}</button>
    <p className="text-center text-sm text-slate-500">¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-viria-700">Ingresar</Link></p>
  </form>
}
