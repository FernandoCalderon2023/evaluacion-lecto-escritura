// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,

  // Capturar info del usuario (IP, headers) — útil para debugging
  sendDefaultPii: true,

  // Performance monitoring: 100% en dev, 10% en producción
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Capturar errores aunque la consola los muestre como handled
  // (útil para errores que ocurren en eventos async)
  attachStacktrace: true,

  // Filtrar errores conocidos / ruido
  beforeSend(event, hint) {
    const error = hint.originalException
    const message = error instanceof Error ? error.message : String(error)

    // No reportar errores 401/403 (son normales por sesión expirada)
    if (message.includes("No autenticado") || message.includes("No autorizado")) {
      return null
    }
    // Errores de red transitorios — no son bugs
    if (message.includes("NetworkError") || message.includes("Failed to fetch")) {
      return null
    }
    // Cancelaciones de fetch (usuario navegó)
    if (error instanceof Error && error.name === "AbortError") {
      return null
    }

    return event
  },

  // Identificar entorno
  environment: process.env.NODE_ENV,
})
