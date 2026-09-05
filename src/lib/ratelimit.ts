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
// Rate limit IA: 20/hora por usuario. Suficiente para pruebas + uso normal.
// Bajar a 5/hora cuando termine la fase de pruebas si es necesario.
export const aiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 h"),
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

  try {
    const { success, reset, remaining } = await limiter.limit(identifier)
    if (success) return { allowed: true }

    const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000)
    return { allowed: false, retryAfterSeconds, remaining }
  } catch (err) {
    // FAIL-OPEN: si Redis/Upstash no responde (base pausada, credenciales vencidas,
    // "r.map is not a function"), NO bloqueamos la operación del usuario.
    // El rate limit es una protección best-effort, nunca un punto único de falla.
    console.warn("[ratelimit] Redis no disponible; se permite la operación:", err instanceof Error ? err.message : String(err))
    return { allowed: true }
  }
}

/* ------------------------------------------------------------------ *
 * Protección de login por intentos FALLIDOS (robusta y a prueba de
 * auto-bloqueo). A diferencia del sliding window, aquí:
 *   - solo cuentan los intentos FALLIDOS (el login exitoso no consume);
 *   - un login correcto LIMPIA el contador;
 *   - falla ABIERTO: si Redis no está o da error, NUNCA bloquea.
 * Umbral generoso: 10 fallos en 15 min por (email + IP).
 * ------------------------------------------------------------------ */
const LOGIN_FAIL_MAX = 10
const LOGIN_FAIL_WINDOW_S = 15 * 60
const loginFailKey = (id: string) => `login:fail:${id}`

/** ¿El identificador superó el máximo de intentos fallidos? Fail-open. */
export async function isLoginBlocked(identifier: string): Promise<boolean> {
  if (!redis) return false
  try {
    const n = await redis.get<number>(loginFailKey(identifier))
    return typeof n === "number" && n >= LOGIN_FAIL_MAX
  } catch {
    return false // nunca bloquear por un fallo de infraestructura
  }
}

/** Registra un intento fallido (incrementa + fija TTL la primera vez). */
export async function registerFailedLogin(identifier: string): Promise<void> {
  if (!redis) return
  try {
    const key = loginFailKey(identifier)
    const n = await redis.incr(key)
    if (n === 1) await redis.expire(key, LOGIN_FAIL_WINDOW_S)
  } catch {
    /* silencioso: la protección es best-effort */
  }
}

/** Limpia el contador de fallos (llamar tras un login exitoso). */
export async function clearFailedLogins(identifier: string): Promise<void> {
  if (!redis) return
  try {
    await redis.del(loginFailKey(identifier))
  } catch {
    /* silencioso */
  }
}

export { redis }
