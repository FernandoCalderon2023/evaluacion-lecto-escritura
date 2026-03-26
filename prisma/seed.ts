import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "path"

const adapter = new PrismaBetterSqlite3({ url: path.resolve(process.cwd(), "dev.db") })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Creando datos de prueba...")

  const est1 = await prisma.estudiante.create({
    data: {
      nombre: "María",
      apellido1: "Quispe",
      apellido2: "Mamani",
      fechaNac: new Date("2016-03-15"),
      grado: "3ro Primaria",
      unidadEducativa: "U.E. Bolivia",
      gestion: 2026,
      docente: "Prof. Ana Flores",
      sexo: "F",
      codigoRude: "RU-00123",
    },
  })

  const est2 = await prisma.estudiante.create({
    data: {
      nombre: "Carlos",
      apellido1: "Chávez",
      apellido2: "Rojas",
      fechaNac: new Date("2015-08-20"),
      grado: "4to Primaria",
      unidadEducativa: "U.E. Bolivia",
      gestion: 2026,
      docente: "Prof. Ana Flores",
      sexo: "M",
    },
  })

  // Evaluación con algunas dificultades
  await prisma.evaluacion.create({
    data: {
      estudianteId: est1.id,
      evaluador: "Prof. Ana Flores",
      tonoVoz: "medio",

      respetaSignosPunt: "AV",
      lecturaVacilante: "CS",
      lecturaSilabica: "AV",
      lecturaCorriente: "AV",
      errorRotacion: "I",
      errorInversion: "M",
      compMemoriza: "CS",
      compIdeas: "AV",
      compValora: "AV",
      compInterpreta: "N",
      compAsocia: "N",
      ej2Bicicleta: true, ej2Mariposa: false, ej2Pez: true,
      ej3a1: true, ej3a2: true, ej3a3: false,
      ej3b1: true, ej3b2: false, ej3b3: false,
      ej4a: true, ej4b: false,
      ej5aFrutas: true, ej5aAnimales: false, ej5aDeportes: false,
      ej5b: true,
      ej6a: false, ej6b: false, ej6c: false,
      ej7: true,
      ej8a: true, ej8b: true, ej8c: false, ej8d: false,
      ej9a: false, ej9b: false, ej9c: true, ej9d: false,
      ej10a: true, ej10b: true, ej10c: false,
      ej11a1: false, ej11a2: false, ej11a3: false, ej11a4: true,
      ej11b1: false, ej11b2: false, ej11b3: true, ej11b4: false,
      ej12a: false, ej12b: false, ej12c: false,
      ej13a: true, ej13b: false, ej13c: false,
      ej14a: false, ej14b: false, ej14c: false,
      dict_invierte: "CS", dict_confOrden: "AV", dict_omite: "CS",
      dict_caligUnif: "R", dict_caligCoord: "R", dict_caligLimp: "R",
      dict_cohConcord: "R", dict_cohTema: "M",
      comp_invierte: "AV",
      comp_caligUnif: "R",
      comp_cohTema: "R",
      scoreCognitivo: 8,
      scoreLexical: 4,
      scoreComprension: 6,
      estadoAprendizaje: "dificultad-moderada",
    },
  })

  // Evaluación sin dificultades
  await prisma.evaluacion.create({
    data: {
      estudianteId: est2.id,
      evaluador: "Prof. Ana Flores",
      tonoVoz: "medio",

      respetaSignosPunt: "S",
      lecturaVacilante: "N",
      lecturaSilabica: "N",
      lecturaCorriente: "S",
      compMemoriza: "CS",
      compIdeas: "CS",
      compValora: "S",
      compInterpreta: "CS",
      compAsocia: "CS",
      ej2Bicicleta: true, ej2Mariposa: true, ej2Pez: true,
      ej3a1: true, ej3a2: true, ej3a3: true,
      ej3b1: true, ej3b2: true, ej3b3: true,
      ej4a: true, ej4b: true,
      ej5aFrutas: true, ej5aAnimales: true, ej5aDeportes: true,
      ej5b: true,
      ej6a: true, ej6b: true, ej6c: true,
      ej7: true,
      ej8a: true, ej8b: true, ej8c: true, ej8d: true,
      ej9a: true, ej9b: true, ej9c: true, ej9d: true,
      ej10a: true, ej10b: true, ej10c: true,
      ej11a1: true, ej11a2: true, ej11a3: true, ej11a4: true,
      ej11b1: true, ej11b2: true, ej11b3: true, ej11b4: true,
      ej12a: true, ej12b: true, ej12c: true,
      ej13a: true, ej13b: true, ej13c: true,
      ej14a: true, ej14b: true, ej14c: true,
      dict_caligUnif: "B", dict_caligCoord: "B", dict_caligLimp: "B",
      dict_cohConcord: "B", dict_cohTema: "B",
      comp_caligUnif: "B",
      comp_cohTema: "B",
      scoreCognitivo: 16,
      scoreLexical: 17,
      scoreComprension: 13,
      estadoAprendizaje: "sin-dificultades",
    },
  })

  console.log("✅ Datos de prueba creados")
}

main().catch(console.error).finally(() => prisma.$disconnect())
