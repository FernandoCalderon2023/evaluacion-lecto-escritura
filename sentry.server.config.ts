// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Capturar también console.error en producción
  // (los logs de Vercel ya los tenemos, pero esto da contexto)
  beforeSend(event, hint) {
    const error = hint.originalException
    const message = error instanceof Error ? error.message : String(error)

    // No reportar errores de auth (esperados)
    if (message.includes("No autenticado") || message.includes("No autorizado")) {
      return null
    }

    return event
  },

  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
})
