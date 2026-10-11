export type WorkspaceKind = "teacher" | "family" | "admin" | "director" | "regional"
export function workspaceProfile(role: string, assignments: string[] = []) {
  const kind: WorkspaceKind = role === "ADMIN" ? "admin" : role === "FAMILIA" ? "family" : assignments.some(r => r === "DISTRITAL" || r === "DEPARTAMENTAL") ? "regional" : assignments.includes("DIRECTOR") ? "director" : "teacher"
  const labels = { teacher: "Espacio docente", family: "Espacio familiar", admin: "Administración", director: "Dirección de unidad educativa", regional: "Seguimiento territorial" }
  return { kind, label: labels[kind], institutional: kind === "director" || kind === "regional" }
}
