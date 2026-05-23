"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LogIn } from "lucide-react"
import { Logo } from "@/components/branding/Logo"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      // Mensaje específico según tipo de error
      const msg = result.error.includes("Demasiados") ? result.error
        : result.error.includes("desactivada") ? result.error
        : "Correo o contraseña incorrectos"
      setError(msg)
      setLoading(false)
    } else {
      // Full reload para que SessionProvider cargue la sesión limpia
      // (más rápido que router.push + refresh que hace 2 renders)
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-viria-900 via-viria-800 to-orchid-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <Logo variant="white" size={48} showText={false} />
          </div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-ia-gradient">SIDEDA</h1>
          <p className="text-viria-200 text-sm mt-1">Sistema de Evaluación de Dificultades de Aprendizaje</p>
          <p className="text-viria-300/60 text-[10px] mt-2 uppercase tracking-widest">Un producto de VirIA</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="docente@ejemplo.com"
                className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500 focus:border-viria-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border-2 border-slate-300 bg-white text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500 focus:border-viria-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-viria-600 to-viria-500 hover:from-viria-700 hover:to-viria-600 text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md shadow-viria-500/30"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Contacte al administrador para obtener acceso
          </p>
        </div>
      </div>
    </div>
  )
}
