import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

/**
 * Cliente Redis singleton (reusa la misma conexión entre requests).
 * En desarrollo sin REDIS, devuelve null y los rate limits se saltean.
 */
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  return new Redis({ url, token })
}

const redis = getRedis()

/**
 * Rate limit para generación de IA: 5 por hora por usuario.
 * Cada usuario puede generar máximo 5 reportes IA en una ventana de 1 hora.
 */
export const aiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix: "rl:ai",
    })
  : null

/**
 * Rate limit general para APIs: 100 requests/min por IP.
 * Protege contra abuso y scraping.
 */
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "rl:api",
    })
  : null

/**
 * Rate limit para login: 10 intentos en 15 minutos por IP.
 * Previene brute force.
 */
export const loginRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      analytics: true,
      prefix: "rl:login",
    })
  : null

/**
 * Rate limit para operaciones admin: 50 por hora por usuario admin.
 */
export const adminRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "1 h"),
      analytics: true,
      prefix: "rl:admin",
    })
  : null

/**
 * Helper para extraer el identificador de IP del request.
 * Usa headers comunes en Vercel.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp
  return "anonymous"
}

/**
 * Aplica un rate limit y devuelve la respuesta apropiada si excede.
 * Si no hay Redis configurado, deja pasar.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ allowed: true } | { allowed: false; retryAfterSeconds: number; remaining: number }> {
  if (!limiter) return { allowed: true }

  const { success, reset, remaining } = await limiter.limit(identifier)
  if (success) return { allowed: true }

  const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000)
  return { allowed: false, retryAfterSeconds, remaining }
}

export { redis }
