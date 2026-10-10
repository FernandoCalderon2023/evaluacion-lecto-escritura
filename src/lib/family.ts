import { z } from "zod"
export const FAMILY_ITEMS = [
  { id: "lectura", titulo: "Compartir una lectura", actividad: "Elijan un texto breve que el niño o la niña conozca. Puede leerlo o escucharte leer. Sin medir velocidad ni insistir si no quiere.", pregunta: "Cuando lee un texto que ya practicó en clase, ¿cómo suele hacerlo?", apoyo: "Comenten con el docente qué textos están trabajando. Pueden alternar la lectura de frases breves, sin comparar velocidades." },
  { id: "comprension", titulo: "Conversar sobre una historia", actividad: "Después de una historia que le guste, pregúntale qué pasó y qué parte le llamó la atención. Permite que responda con palabras o dibujos.", pregunta: "¿Cómo suele contar lo que pasó en una historia que leyó o escuchó?", apoyo: "Pueden conversar sobre una historia usando dibujos y preguntas abiertas. Compartan con el docente qué preguntas necesitaron acompañamiento." },
  { id: "escritura", titulo: "Escribir con un propósito", actividad: "Propón una lista, una nota o un mensaje corto con palabras que ya conoce. No dictes contenido nuevo ni califiques la letra.", pregunta: "¿Cómo suele escribir un mensaje breve con palabras que ya trabajó?", apoyo: "Pueden preparar juntos una lista o nota corta, pensando primero qué quieren comunicar. Revisen con el docente ejemplos de trabajos habituales." },
  { id: "instrucciones", titulo: "Seguir una actividad cotidiana", actividad: "Piensa en una rutina conocida, como preparar los materiales de clase. Explica los pasos con calma y comprueba que entendió.", pregunta: "En una rutina conocida, ¿cómo suele seguir dos indicaciones sencillas?", apoyo: "Pueden dar una indicación por vez y acompañarla con un dibujo. Comenten con el docente qué apoyos facilitan la rutina." },
  { id: "bienestar", titulo: "Cómo se siente al aprender", actividad: "Conversen en un momento tranquilo sobre cómo se siente al leer o escribir. Puedes registrar lo que has observado sin pedirle repetir una tarea difícil.", pregunta: "Para participar con tranquilidad en lectura o escritura, ¿cuánto acompañamiento suele necesitar?", apoyo: "Escuchen cómo se siente, hagan pausas y eviten comparaciones. Si el malestar persiste, conversen con el docente para acordar acompañamiento." },
  { id: "rutina", titulo: "Organizar un momento de aprendizaje", actividad: "Piensa en sus tareas habituales y en el apoyo disponible en casa. El cansancio, el idioma y el ambiente también influyen.", pregunta: "En un momento habitual de tarea, ¿cuánto acompañamiento suele necesitar para comenzar?", apoyo: "Pueden acordar un lugar y un momento tranquilo, con materiales listos y pausas. Revisen si la tarea es familiar y las instrucciones son claras." },
] as const
export const FAMILY_ANSWERS = [
 { value: "autonomo", label: "Generalmente lo hace con autonomía" },
 { value: "a_veces", label: "A veces necesita acompañamiento" },
 { value: "frecuente", label: "Suele necesitar acompañamiento" },
 { value: "no_observado", label: "No lo he observado / todavía no lo trabajó" },
] as const
const answer = z.enum(["autonomo", "a_veces", "frecuente", "no_observado"])
export const familySchema = z.object({
 id: z.string().uuid(), alias: z.string().trim().min(1).max(30), edad: z.number().int().min(6).max(12),
 respuestas: z.object({ lectura: answer, comprension: answer, escritura: answer, instrucciones: answer, bienestar: answer, rutina: answer }).strict(),
 autoriza: z.literal(true),
}).strict()
export type FamilyInput = z.infer<typeof familySchema>
export function familySummary(respuestas: FamilyInput["respuestas"]) {
 const observado = FAMILY_ITEMS.filter(i => respuestas[i.id] !== "no_observado")
 return { observados: observado.length, total: FAMILY_ITEMS.length,
  autonomos: FAMILY_ITEMS.filter(i => respuestas[i.id] === "autonomo").map(i => i.titulo),
  apoyos: FAMILY_ITEMS.filter(i => ["a_veces", "frecuente"].includes(respuestas[i.id])).map(i => ({ area: i.titulo, sugerencia: i.apoyo })),
  pendientes: FAMILY_ITEMS.filter(i => respuestas[i.id] === "no_observado").map(i => i.titulo),
 }
}
