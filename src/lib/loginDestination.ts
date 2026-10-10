/** Only allow same-origin application routes after sign-in. */
export function loginDestination(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return "/dashboard"
  try {
    const url = new URL(value, "https://sideda.com")
    if (url.origin !== "https://sideda.com" || !/^\/(dashboard|estudiantes|evaluaciones|admin|guia|suscripcion|cuenta|familia)(\/|$)/.test(url.pathname)) return "/dashboard"
    return url.pathname + url.search + url.hash
  } catch { return "/dashboard" }
}
