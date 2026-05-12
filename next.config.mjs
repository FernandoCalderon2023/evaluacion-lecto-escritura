import { withSentryConfig } from "@sentry/nextjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Required for Sentry instrumentation in Next.js 14
    instrumentationHook: true,
  },
}

export default withSentryConfig(nextConfig, {
  // Suppresses source map uploading logs during build
  silent: true,

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Hide source maps from generated client bundles (don't expose to users)
  hideSourceMaps: true,

  // Auto-instrumentation: agrega tracing automático a fetch, db queries, etc.
  // Solo activar si NO se acumula latencia. Para 100 concurrent users sí vale.
  autoInstrumentServerFunctions: true,

  // Tunnel para evitar bloqueos de ad-blockers
  tunnelRoute: "/monitoring",

  // Don't tree-shake logger statements (mantener console.error en producción)
  disableLogger: false,

  // Upload source maps solo si tenemos auth token
  ...(process.env.SENTRY_AUTH_TOKEN
    ? { authToken: process.env.SENTRY_AUTH_TOKEN }
    : { sourcemaps: { disable: true } }),
})
