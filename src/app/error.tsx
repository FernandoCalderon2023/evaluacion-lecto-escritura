"use client"

import Link from "next/link"
import { useEffect } from "react"
import { AlertTriangle, Home, RotateCw } from "lucide-react"
import * as Sentry from "@sentry/nextjs"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[App Error]", error)
    // Reportar a Sentry con contexto adicional
    Sentry.captureException(error, {
      tags: { boundary: "app-error" },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Algo salió mal</h1>
        <p className="text-sm text-slate-600 mb-6">
          Ocurrió un error inesperado. Por favor intenta de nuevo o vuelve al inicio.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 font-mono mb-4">
            ID: {error.digest}
          </p>
        )}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700"
          >
            <RotateCw className="h-4 w-4" />
            Reintentar
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border-2 border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            Inicio
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-6">
          Si el problema persiste, contacta al administrador.
        </p>
      </div>
    </div>
  )
}
