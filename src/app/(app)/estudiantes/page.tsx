import { getWorkspaceProfile } from "@/lib/getWorkspaceProfile"
import { canAccessResource } from "@/lib/apiAuth"
export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { getAuthContext, resolveScope } from "@/lib/apiAuth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, User } from "lucide-react"

export default async function EstudiantesPage(
  props: {
    searchParams: Promise<{ q?: string; pagina?: string }>
  }
) {
  const searchParams = await props.searchParams;
  const q = searchParams.q ?? ""
  const auth = await getAuthContext()
  if (!auth) redirect("/login")
  const profile = await getWorkspaceProfile(auth.userId, auth.role)
  const scope = await resolveScope(auth, "individual")
  const search = q ? { OR: [{ codigo: { contains: q } }, { nombre: { contains: q } }, { apellido1: { contains: q } }] } : null
  const where: any = search ? { AND: [scope, search] } : scope

  const pageSize = 24
  const total = await prisma.estudiante.count({where})
  const totalPages = Math.max(1,Math.ceil(total/pageSize))
  const requested = Number(searchParams.pagina)
  const page = Math.min(totalPages,Number.isSafeInteger(requested) && requested>0 ? requested : 1)
  const estudiantes = await prisma.estudiante.findMany({
    where, orderBy: [{createdAt:"desc"},{id:"desc"}], skip:(page-1)*pageSize,take:pageSize,
    select:{id:true,nombre:true,apellido1:true,docenteId:true,codigo:true,grado:true,unidadEducativa:true,sexo:true,_count:{select:{evaluaciones:true}}},
  })
  const pageHref = (n:number) => `/estudiantes?${new URLSearchParams({q,pagina:String(n)})}`


  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{profile.kind === "teacher" ? "Mis alumnos" : "Estudiantes"}</h1>
          <p className="text-slate-500 text-sm mt-1">{total} registrado(s) · {profile.institutional ? "Consulta según tus asignaciones. Solo puedes evaluar tus propios registros." : "Abre su historial o empieza una evaluación desde su tarjeta."}</p>
        </div>
        <Link
          href="/estudiantes/nuevo"
          className="flex items-center gap-2 bg-viria-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-viria-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo estudiante
        </Link>
      </div>

      <form method="GET" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por código, nombre o apellido..."
          aria-label="Buscar estudiantes"
          className="min-w-0 flex-1 border border-slate-300 bg-white text-slate-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-viria-500"
        />
        <button
          type="submit"
          className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700"
        >
          Buscar
        </button>
      </form>

      {estudiantes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-slate-400">
            {q ? "No se encontraron estudiantes con esa búsqueda." : "No hay estudiantes registrados aún."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estudiantes.map((est) => (
            <div key={est.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-viria-100 rounded-full p-2">
                      <User className="h-5 w-5 text-viria-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate font-mono text-base">
                        <Link href={`/estudiantes/${est.id}`}>{est.nombre} {est.apellido1}</Link>
                      </p>
                      <p className="text-xs text-slate-500">{est.codigo ?? "—"} · {est.grado} · {est.unidadEducativa}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {est._count.evaluaciones} evaluación(es)
                        </Badge>
                        <span className="text-xs text-slate-400">{est.sexo === "M" ? "Masculino" : "Femenino"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 border-t pt-3 text-sm"><Link className="inline-flex min-h-11 items-center font-semibold text-viria-700" href={`/estudiantes/${est.id}`}>Ver historial</Link>{canAccessResource(auth, est.docenteId) && <Link className="inline-flex min-h-11 items-center rounded-lg bg-viria-600 px-3 font-semibold text-white" href={`/evaluaciones/nueva?estudianteId=${est.id}`}>Evaluar alumno</Link>}</div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
      {totalPages>1 && <nav aria-label="Páginas de estudiantes" className="flex items-center justify-between gap-3 text-sm">{page>1?<Link className="rounded-lg border bg-white px-4 py-2" href={pageHref(page-1)}>Anterior</Link>:<span/>}<span className="text-slate-500">Página {page} de {totalPages}</span>{page<totalPages?<Link className="rounded-lg border bg-white px-4 py-2" href={pageHref(page+1)}>Siguiente</Link>:<span/>}</nav>}
    </div>
  )
}
