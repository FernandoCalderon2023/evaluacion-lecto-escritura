import { z } from "zod"

export const estudianteSchema = z.object({
  nombre: z.string().trim().min(1, "Nombre requerido").max(100),
  apellido1: z.string().trim().min(1, "Apellido requerido").max(100),
  apellido2: z.string().trim().max(100).nullable().optional(),
  fechaNac: z.string().or(z.date()),
  grado: z.string().trim().min(1).max(50),
  unidadEducativa: z.string().trim().min(1).max(200),
  gestion: z.coerce.number().int().min(2000).max(2100),
  docente: z.string().trim().min(1).max(150),
  sexo: z.string().trim().min(1).max(20),
  codigoRude: z.string().trim().max(50).nullable().optional(),
  domicilio: z.string().trim().max(300).nullable().optional(),
})

export const usuarioCreateSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre muy corto").max(100),
  email: z.string().trim().toLowerCase().email("Email inválido").max(200),
  password: z.string().min(6, "Mínimo 6 caracteres").max(200),
  rol: z.enum(["ADMIN", "DOCENTE"]).default("DOCENTE"),
})

export const usuarioUpdateSchema = z.object({
  activo: z.boolean().optional(),
  nombre: z.string().trim().min(2).max(100).optional(),
})

// Para evaluación: aceptamos cualquier campo, la lógica de scoring valida valores
export const evaluacionSchema = z.object({
  estudianteId: z.string().min(1, "Estudiante requerido"),
  evaluador: z.string().trim().min(1, "Evaluador requerido").max(150),
  fecha: z.string().or(z.date()),
  edadAlEvaluar: z.coerce.number().int().min(3).max(25).nullable().optional(),
  anioEscolar: z.coerce.number().int().min(0).max(12).nullable().optional(),
  observaciones: z.string().max(2000).nullable().optional(),
}).passthrough() // permitir campos extra del wizard

export type EstudianteInput = z.infer<typeof estudianteSchema>
export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>
export type EvaluacionInput = z.infer<typeof evaluacionSchema>

/** Helper para responder errores de validación de forma consistente */
export function validationError(error: z.ZodError) {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join(".")
    fields[path] = issue.message
  }
  return {
    error: "Datos inválidos",
    fields,
  }
}
