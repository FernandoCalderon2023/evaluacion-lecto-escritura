import { Client } from "@upstash/qstash"

let _client: Client | null | undefined

export function getQStash(): Client | null {
  if (_client !== undefined) return _client
  const token = process.env.QSTASH_TOKEN?.trim()
  if (!token) {
    _client = null
    return null
  }
  _client = new Client({ token })
  return _client
}

/**
 * URL base de la app — necesaria para webhooks de QStash.
 * En Vercel se setea VERCEL_URL automáticamente para preview, NEXTAUTH_URL en prod.
 */
export function getAppUrl(): string {
  const explicit = process.env.NEXTAUTH_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")
  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) return `https://${vercel}`
  return "http://localhost:3001"
}
