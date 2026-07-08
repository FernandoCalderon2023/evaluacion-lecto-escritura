import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getQStash, getAppUrl } from "@/lib/qstash"
import { requireAdmin } from "@/lib/apiAuth"

export const maxDuration = 60

const BATCH_PREFIX = "LOADTEST"

/**
 * Carga de prueba: crea N estudiantes ficticios, N evaluaciones con datos
 * generados, y encola N jobs de análisis IA en paralelo.
 *
 * Auth: GET con ?token=NEXTAUTH_SECRET
 *
 * Uso:
 *   curl "https://sideda.com/api/admin/load-test/start?token=SECRET&count=40"
 *
 * Devuelve { batchId, jobIds, estudiantes }.
 * Después usa /api/admin/load-test/status?batchId=X para monitorear.
 * Y /api/admin/load-test/cleanup?batchId=X para borrar todo.
 */
export async function GET(req: NextRequest) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.response
  const url = new URL(req.url)

  const count = Math.min(parseInt(url.searchParams.get("count") || "10", 10), 100)
  const batchId = `${BATCH_PREFIX}-${Date.now()}`

  try {
    const startedAt = Date.now()

    // Buscar/crear docente de prueba
    const docenteTestEmail = "loadtest@sideda.com"
    let docente = await prisma.usuario.findUnique({ where: { email: docenteTestEmail } })
    if (!docente) {
      const bcrypt = (await import("bcryptjs")).default
      docente = await prisma.usuario.create({
        data: {
          email: docenteTestEmail,
          passwordHash: await bcrypt.hash("loadtest-no-login", 10),
          nombre: "Docente Load Test",
          rol: "DOCENTE",
          activo: false, // No puede loguearse
        },
      })
    }

    // 1. Crear N estudiantes
    const estudiantesData = Array.from({ length: count }, (_, i) => {
      const num = String(i + 1).padStart(3, "0")
      const sexo = i % 2 === 0 ? "Femenino" : "Masculino"
      const grado = (i % 6) + 1
      return {
        codigo: `${batchId}-${num}`,
        nombre: `LoadTest${num}`,
        apellido1: "Prueba",
        apellido2: "Carga",
        fechaNac: new Date(2015 + (i % 5), i % 12, (i % 28) + 1),
        grado: `${grado}° de Primaria`,
        unidadEducativa: "U.E. Test Carga",
        gestion: new Date().getFullYear(),
        docente: "Docente Test",
        sexo,
        docenteId: docente.id,
      }
    })

    await prisma.estudiante.createMany({ data: estudiantesData })
    const estudiantes = await prisma.estudiante.findMany({
      where: { codigo: { startsWith: `${batchId}-` } },
      select: { id: true, codigo: true, sexo: true, grado: true },
    })

    // 2. Crear N evaluaciones con datos sintéticos pero realistas
    const evaluacionesData = estudiantes.map((est, i) => {
      const dificultad = i % 4 // 0=ok, 1=leve, 2=moderada, 3=severa
      const anio = parseInt(est.grado.charAt(0))
      return {
        estudianteId: est.id,
        docenteId: docente.id,
        evaluador: "Docente Test Carga",
        edadAlEvaluar: 5 + anio,
        anioEscolar: anio,
        observaciones: `Evaluación generada automáticamente para prueba de carga (batch ${batchId})`,
        palabrasLeidas: 30 + (i % 60),

        // Lectura - varía según dificultad
        tonoVoz: "medio",
        respetaSignosPunt: dificultad === 0 ? "S" : dificultad === 1 ? "CS" : "AV",
        lecturaVacilante: dificultad >= 2 ? "S" : "AV",
        lecturaSilabica: dificultad >= 2 ? "CS" : "N",
        lecturaCorriente: dificultad === 0 ? "S" : "AV",

        errorCambioLetras: dificultad >= 2 ? "M" : "N",
        errorOmision: dificultad >= 2 ? "I" : "N",
        errorInversion: dificultad >= 3 ? "M" : "N",
        errorCambioSilabas: "N",
        errorCambioPalabras: "N",
        errorAdicion: "N",
        errorRepeticion: "N",
        errorRotacion: "N",

        compMemoriza: dificultad === 0 ? "S" : "AV",
        compIdeas: dificultad <= 1 ? "CS" : "AV",
        compValora: dificultad === 0 ? "S" : "AV",
        compInterpreta: dificultad <= 1 ? "CS" : "AV",
        compAsocia: dificultad === 0 ? "CS" : "AV",

        // Cognitivos - varía
        ej2Bicicleta: dificultad === 0 ? 3 : Math.max(0, 3 - dificultad),
        ej2Mariposa: dificultad === 0 ? 1 : (dificultad < 3 ? 1 : 0),
        ej2Pez: dificultad === 0 ? 2 : Math.max(0, 2 - dificultad),
        ej3a1: dificultad < 2, ej3a2: dificultad < 2, ej3a3: dificultad === 0,
        ej3b1: dificultad < 2, ej3b2: dificultad < 2, ej3b3: dificultad === 0,
        ej4a: dificultad < 3, ej4b: dificultad < 2,
        ej5aFrutas: dificultad < 3, ej5aAnimales: dificultad < 2, ej5aDeportes: dificultad < 2,
        ej5b: dificultad < 2,
        ej6a: dificultad < 3, ej6b: dificultad < 2, ej6c: dificultad < 2,
        ej7: dificultad < 2,
        ej8a: dificultad < 3, ej8b: dificultad < 2, ej8c: dificultad < 2, ej8d: dificultad === 0,
        ej9a: dificultad < 3, ej9b: dificultad < 2, ej9c: dificultad < 2, ej9d: dificultad === 0,
        ej10a: dificultad < 2, ej10b: dificultad < 2, ej10c: dificultad === 0,

        // Léxicos
        ej11a1: dificultad < 3, ej11a2: dificultad < 2, ej11a3: dificultad < 2, ej11a4: dificultad === 0,
        ej11b1: dificultad < 3, ej11b2: dificultad < 2, ej11b3: dificultad < 2, ej11b4: dificultad === 0,
        ej12a: dificultad < 3, ej12b: dificultad < 2, ej12c: dificultad < 2,
        ej13a: dificultad < 3, ej13b: dificultad < 2, ej13c: dificultad === 0,
        ej14a: dificultad < 3, ej14b: dificultad < 2, ej14c: dificultad === 0,

        // Escritura (B/R/M defaults manejados por schema)
      }
    })

    await prisma.evaluacion.createMany({ data: evaluacionesData })
    const evaluaciones = await prisma.evaluacion.findMany({
      where: { docenteId: docente.id, evaluador: "Docente Test Carga" },
      orderBy: { createdAt: "desc" },
      take: count,
      select: { id: true, estudianteId: true },
    })

    // 3. Crear AnalysisJob para cada uno + encolar en QStash
    const jobsData = evaluaciones.map((ev) => ({
      evaluacionId: ev.id,
      docenteId: docente.id,
      status: "queued",
    }))
    await prisma.analysisJob.createMany({ data: jobsData })

    const jobs = await prisma.analysisJob.findMany({
      where: {
        evaluacionId: { in: evaluaciones.map((e) => e.id) },
        status: "queued",
      },
      select: { id: true, evaluacionId: true },
    })

    // 4. Encolar todos en QStash
    const qstash = getQStash()
    if (!qstash) {
      return NextResponse.json({ error: "QStash no configurado" }, { status: 500 })
    }

    const targetUrl = `${getAppUrl()}/api/jobs/process-analysis`
    let queued = 0
    let failed = 0

    // Encolar en paralelo
    await Promise.all(
      jobs.map(async (job) => {
        try {
          await qstash.publishJSON({
            url: targetUrl,
            body: { jobId: job.id, evaluacionId: job.evaluacionId },
            retries: 2,
            flowControl: { key: "ai-analysis", parallelism: 5 },
          })
          queued++
        } catch (err) {
          console.error(`Failed to queue job ${job.id}:`, err)
          failed++
          await prisma.analysisJob.update({
            where: { id: job.id },
            data: { status: "failed", error: "Failed to queue" },
          })
        }
      })
    )

    const setupMs = Date.now() - startedAt

    return NextResponse.json({
      ok: true,
      batchId,
      count,
      queued,
      failed,
      setupMs,
      jobIds: jobs.map((j) => j.id),
      statusUrl: `/api/admin/load-test/status?batchId=${batchId}`,
      cleanupUrl: `/api/admin/load-test/cleanup?batchId=${batchId}`,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[load-test/start] Error:", msg)
    return NextResponse.json({ error: msg, batchId }, { status: 500 })
  }
}
