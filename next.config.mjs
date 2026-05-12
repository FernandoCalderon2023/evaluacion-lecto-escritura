import { withSentryConfig } from "@sentry/nextjs"

const securityHeaders = [
  // Fuerza HTTPS por 1 año (incluye subdominios)
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // No permitir embedding en iframes (anti clickjacking)
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // No sniffing de content type
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // No enviar referer a sitios externos completos
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Permisos mínimos: no acceder a cámara, mic, geolocation salvo que sea estrictamente necesario
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // X-XSS-Protection (legacy pero útil)
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Habilitar compresión gzip/brotli (default en Vercel pero explícito)
  compress: true,
  // Quitar header "powered by Next.js"
  poweredByHeader: false,
  // React strict mode (mejor debugging)
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: "/:path*",
        headers: securityHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  hideSourceMaps: true,
  autoInstrumentServerFunctions: true,
  tunnelRoute: "/monitoring",
  disableLogger: false,
  ...(process.env.SENTRY_AUTH_TOKEN
    ? { authToken: process.env.SENTRY_AUTH_TOKEN }
    : { sourcemaps: { disable: true } }),
})
