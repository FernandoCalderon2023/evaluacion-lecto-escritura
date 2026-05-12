"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { AlertTriangle, Home, RotateCw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { boundary: "global-error" },
      extra: { digest: error.digest },
    })
  }, [error])

  return (
    <html lang="es">
      <body>
        <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "Arial, sans-serif" }}>
          <div style={{ maxWidth: "28rem", width: "100%", background: "white", borderRadius: "1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", padding: "2rem", textAlign: "center" }}>
            <div style={{ background: "#fee2e2", borderRadius: "9999px", width: "4rem", height: "4rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <AlertTriangle style={{ width: "2rem", height: "2rem", color: "#dc2626" }} />
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
              Error crítico
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "1.5rem" }}>
              Algo falló al renderizar la aplicación. El equipo ya fue notificado.
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace", marginBottom: "1rem" }}>
                ID: {error.digest}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
              <button
                onClick={() => reset()}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#2563eb", color: "white", padding: "0.625rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600, border: "none", cursor: "pointer" }}
              >
                <RotateCw style={{ width: "1rem", height: "1rem" }} />
                Reintentar
              </button>
              <a
                href="/dashboard"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "2px solid #cbd5e1", color: "#334155", padding: "0.625rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}
              >
                <Home style={{ width: "1rem", height: "1rem" }} />
                Inicio
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
