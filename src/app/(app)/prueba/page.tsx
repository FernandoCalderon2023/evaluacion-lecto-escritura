import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthContext } from "@/lib/apiAuth"
import { trialAccess } from "@/lib/commercial"
import { prisma } from "@/lib/prisma"
import { calcularScores } from "@/lib/scoring"
import { classificationSelect } from "@/lib/classificationSelect"

export default async function TrialPage() {
 const auth=await getAuthContext(); if(!auth) redirect("/login")
 const access=await trialAccess(auth.userId)
 const family=auth.role==="FAMILIA"
 if(access?.estado!=="PRUEBA") redirect(family?"/familia":"/dashboard")
 const student=family?null:await prisma.estudiante.findFirst({where:{docenteId:auth.userId},select:{id:true},orderBy:{createdAt:"desc"}})
 const evaluation=family?null:await prisma.evaluacion.findFirst({where:{docenteId:auth.userId,estudiante:{docenteId:auth.userId}},select:{...classificationSelect,id:true},orderBy:{createdAt:"desc"}})
 const observation=family?await prisma.observacionFamiliar.findFirst({where:{usuarioId:auth.userId},select:{id:true},orderBy:{updatedAt:"desc"}}):null
 const complete=evaluation?calcularScores(evaluation as any).estadoGeneral!=="evaluacion-incompleta":false
 const resultHref=family?observation?`/familia/${observation.id}`:null:evaluation?`/evaluaciones/${evaluation.id}`:null
 const canCreate=family?access.evaluacionesUsadas<1:access.estudiantesUsados<1
 const nextHref=family?resultHref??(canCreate?"/familia/nueva":"/suscripcion"):evaluation?`/evaluaciones/${evaluation.id}${complete?"":"/editar"}`:access.evaluacionesUsadas>=1?"/suscripcion":student?`/evaluaciones/nueva?estudianteId=${student.id}`:canCreate?"/estudiantes/nuevo":"/suscripcion"
 const steps=family?[
  {title:"Tu espacio está listo",done:true,text:"Una cuenta privada para registrar lo que observas en casa."},
  {title:"Guarda tus seis respuestas",done:!!observation,text:"Puedes indicar No observado. No hay examen ni cronómetro para tu hijo."},
  {title:"Orientación disponible",done:!!observation,text:"Recibe sugerencias según tus respuestas, revisa el resumen e imprímelo."},
 ]:[
  {title:"Registra al estudiante",done:!!student,text:"Identifica tu primer caso; puedes usar datos ficticios para explorar."},
  {title:"Guarda la evaluación",done:!!evaluation,text:"Usa las preguntas, las ayudas y el cronómetro. También puedes transcribir papel."},
  {title:"Revisa las cinco áreas",done:complete,text:"Completa solo lo aplicado; un registro parcial ya permite consultar pendientes y descargar un resumen."},
 ]
 return <main className="mx-auto max-w-5xl space-y-7 p-5 lg:p-8"><header><p className="text-xs font-semibold uppercase tracking-widest text-viria-700">Tu experiencia gratuita · {family?"Familias":"Docentes y profesionales"}</p><h1 className="mt-3 text-3xl font-semibold">{family?"De lo que observas a una conversación útil.":"Completa tu primer caso y llévate un resultado útil."}</h1><p className="mt-4 text-slate-600">{family?"Un registro editable, orientación según tus respuestas y pasos para preparar el seguimiento en casa.":"Un estudiante, una evaluación editable, resultados por área y resúmenes imprimibles para el evaluador y la familia."} Sin tarjeta ni cobros automáticos.</p></header>
 <section className="rounded-2xl border border-viria-200 bg-white p-5"><h2 className="font-semibold">Tu recorrido: {steps.filter(s=>s.done).length} de 3 etapas disponibles</h2><ol className="mt-5 grid gap-4 md:grid-cols-3">{steps.map((step,i)=><li key={step.title} className={`rounded-xl border p-4 ${step.done?"border-viria-200 bg-viria-50":"border-slate-200"}`}><p className="text-xs font-semibold text-viria-700">{step.done?"✓ Disponible":"Por completar"} · {i+1}</p><h3 className="mt-2 font-semibold">{step.title}</h3><p className="mt-2 text-sm text-slate-600">{step.text}</p></li>)}</ol><div className="mt-5 flex flex-wrap gap-3"><Link href={nextHref} className="inline-flex min-h-12 items-center rounded-xl bg-viria-900 px-5 py-3 font-semibold text-white">{nextHref==="/suscripcion"?"Consultar cómo ampliar mi acceso":resultHref?family||complete?"Abrir mi resultado":"Retomar mi evaluación":"Empezar mi prueba"}</Link>{resultHref&&!complete&&!family&&<Link href={resultHref} className="inline-flex min-h-12 items-center rounded-xl border px-4 text-sm font-semibold">Ver mi resumen parcial</Link>}</div></section>
 <section className="grid gap-4 sm:grid-cols-2"><article className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Puedes explorar antes de gastar tu cupo</h2><p className="mt-3 text-sm text-slate-600">El ejemplo usa datos ficticios y no crea registros en tu cuenta. Puedes volver a verlo cuantas veces necesites.</p><Link href="/demo" className="mt-4 inline-block font-semibold text-viria-700">Ver ejemplo de presentación →</Link>{!family&&<Link href="/evaluaciones/instrumento" className="mt-4 block text-sm font-semibold text-viria-700">Explorar o imprimir las actividades →</Link>}</article><article className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Lo que conservarás</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600"><li>Tu registro guardado, que puedes editar sin usar otro cupo.</li><li>{family?"Resumen, sugerencias y pasos para el seguimiento en casa.":"Resultados de las áreas registradas y lista de pendientes."}</li><li>Impresión o PDF desde el navegador.</li></ul></article></section>
 <details className="rounded-xl border bg-white p-5"><summary className="cursor-pointer font-semibold">Qué incluye la prueba y qué requiere ampliar el acceso</summary><p className="mt-3 text-sm text-slate-600">{family?"Incluye 1 registro familiar. Más registros requieren ampliar el acceso; la cuenta sigue siendo familiar.":"Incluye 1 estudiante y 1 evaluación, con ayudas y resúmenes sin IA. Más casos y generación de recomendaciones con IA requieren ampliar el acceso."} El cupo se utiliza al guardar un registro nuevo. Editar no consume otro cupo; eliminar no lo repone. El ejemplo ilustrativo no equivale a un análisis de tus datos.</p><Link href="/suscripcion" className="mt-3 inline-block text-sm font-semibold text-viria-700">{access.solicitadoEn?"Ver mi solicitud":"Consultar el acceso ampliado"} →</Link></details>
 </main>
}
