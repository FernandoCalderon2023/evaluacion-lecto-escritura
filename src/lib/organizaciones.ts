import { prisma } from "@/lib/prisma"
import { normKey, nombreLimpio } from "@/lib/normalize"

/**
 * Busca la Unidad Educativa por nombre NORMALIZADO (fusiona variantes de tipeo:
 * acentos, mayúsculas, espacios) o la crea si no existe. Devuelve su id, o null
 * si el nombre viene vacío.
 *
 * Escala actual (decenas de colegios): compara en memoria. A mayor escala, añadir
 * una columna normalizada con índice único.
 */
export async function findOrCreateUE(nombreRaw: string | null | undefined): Promise<string | null> {
  const nombre = nombreLimpio(nombreRaw)
  if (!nombre) return null

  const key = normKey(nombre)
  const existentes = await prisma.organizacion.findMany({
    where: { tipo: "UNIDAD_EDUCATIVA" },
    select: { id: true, nombre: true },
  })
  const match = existentes.find((o) => normKey(o.nombre) === key)
  if (match) return match.id

  const creada = await prisma.organizacion.create({
    data: { nombre, tipo: "UNIDAD_EDUCATIVA" },
  })
  // path materializado = su propio id mientras no cuelgue de un distrito/departamento.
  await prisma.organizacion.update({ where: { id: creada.id }, data: { path: creada.id } })
  return creada.id
}

/**
 * Crea una organización en la jerarquía y calcula su `path` materializado.
 * Raíz → path = su id. Con padre → path = padre.path + "/" + id.
 */
export async function crearOrganizacion(input: {
  nombre: string
  tipo: string
  parentId?: string | null
  codigoSie?: string | null
}) {
  const nombre = nombreLimpio(input.nombre)
  let parentPath = ""
  if (input.parentId) {
    const parent = await prisma.organizacion.findUnique({
      where: { id: input.parentId },
      select: { id: true, path: true },
    })
    if (!parent) throw new Error("Organización superior no encontrada")
    parentPath = parent.path || parent.id
  }
  const org = await prisma.organizacion.create({
    data: {
      nombre,
      tipo: input.tipo,
      parentId: input.parentId ?? null,
      codigoSie: input.codigoSie ?? null,
      path: "",
    },
  })
  const path = parentPath ? `${parentPath}/${org.id}` : org.id
  return prisma.organizacion.update({ where: { id: org.id }, data: { path } })
}
