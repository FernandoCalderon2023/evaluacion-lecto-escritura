"use client"
import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { ArrowLeft, ArrowRight, Eye, EyeOff, FileText, LogIn } from "lucide-react"
import { Logo } from "@/components/branding/Logo"
import { loginDestination } from "@/lib/loginDestination"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      const result = await signIn("credentials", { email: email.trim(), password, redirect: false })
      if (!result || result.error || !result.ok) {
        const message = result?.error ?? ""
        setError(message.includes("Demasiados") || message.includes("desactivada") ? message : "Revisa tu correo y contraseña e inténtalo de nuevo.")
        return
      }
      const callback = new URL(window.location.href).searchParams.get("callbackUrl")
      window.location.assign(loginDestination(callback))
    } catch {
      setError("No pudimos conectar. Comprueba tu conexión e inténtalo de nuevo.")
    } finally { setLoading(false) }
  }

  return <main className="grid min-h-screen bg-[#fafaf7] lg:grid-cols-2">
    <section className="hidden flex-col justify-between bg-viria-900 p-12 text-white lg:flex xl:p-16">
      <Link href="/" className="flex items-center gap-3"><Logo variant="white" size={36} showText={false}/><span className="text-2xl font-bold tracking-tight">SIDEDA</span></Link>
      <div className="max-w-lg py-16"><p className="text-xs font-medium uppercase tracking-[0.2em] text-viria-200">Tu espacio de trabajo</p><h1 className="mt-6 text-5xl font-semibold leading-tight tracking-tight">Cada estudiante.<br/>Un camino por acompañar.</h1><p className="mt-6 text-base leading-relaxed text-viria-100/80">Organiza tus evaluaciones, revisa los resultados y encuentra el próximo paso para apoyar el aprendizaje.</p><Link href="/demo" className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-white underline underline-offset-4">Conoce un ejemplo de informe <ArrowRight size={17}/></Link></div>
      <p className="text-xs text-viria-200">Un producto de VirIA · Bolivia</p>
    </section>
    <section className="flex flex-col justify-center px-6 py-10 sm:px-12">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-viria-700"><ArrowLeft size={16}/>Volver a SIDEDA</Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-viria-700">Bienvenido a tu cuenta</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Continuemos acompañando.</h2><p className="mt-3 text-sm leading-relaxed text-slate-500">Ingresa con el correo y la contraseña que te asignó tu administrador.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} value={email} onChange={e=>setEmail(e.target.value)} required disabled={loading} placeholder="tu.correo@ejemplo.com" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-viria-600"/></div>
          <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Contraseña</label><div className="relative"><input id="password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required disabled={loading} aria-describedby={error ? "login-error" : undefined} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-12 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-viria-600"/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={visible} className="absolute inset-y-0 right-0 px-4 text-slate-500">{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>
          {error && <p id="login-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-viria-900 px-5 py-3.5 text-sm font-semibold text-white hover:bg-viria-800 disabled:opacity-60"><LogIn size={17}/>{loading ? "Ingresando…" : "Ingresar a mi espacio"}</button>
        </form>
        <p className="mt-5 text-xs leading-relaxed text-slate-500">Si necesitas acceso o recuperar tu contraseña, contacta a la persona que te habilitó la cuenta.</p>
        <Link href="/demo" className="mt-9 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4"><div className="flex gap-3"><FileText size={20} className="mt-0.5 text-viria-700"/><div><p className="text-sm font-semibold text-slate-800">¿Quieres conocer SIDEDA?</p><p className="mt-1 text-xs text-slate-500">Explora un ejemplo sin iniciar sesión.</p></div></div><ArrowRight size={17} className="text-slate-400"/></Link>
        <div className="mt-8 flex gap-5 text-xs text-slate-500"><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos de uso</Link></div>
      </div>
    </section>
  </main>
}
