import Link from "next/link"
import { FileQuestion, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="bg-viria-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <FileQuestion className="h-8 w-8 text-viria-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Página no encontrada</h1>
        <p className="text-sm text-slate-600 mb-6">
          La página que buscas no existe o fue eliminada.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-viria-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-viria-700"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
