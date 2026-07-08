/**
 * Normalización de nombres de Unidad Educativa (y otros nombres libres).
 * Módulo PURO — sin dependencias de Prisma/DB — para poder testearlo aislado.
 */

/** Clave normalizada: sin acentos, espacios colapsados, mayúsculas. Fusiona variantes de tipeo. */
export function normKey(s: string | null | undefined): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quitar diacríticos
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase()
}

/** Limpieza ligera para guardar como nombre "bonito": colapsa espacios y recorta. */
export function nombreLimpio(s: string | null | undefined): string {
  return (s ?? "").replace(/\s+/g, " ").trim()
}
