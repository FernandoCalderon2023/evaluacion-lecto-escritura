import { EVALUACION_DEFAULTS } from "@/types/evaluacion"
import type { Prisma } from "@prisma/client"
const reading=["cognitivoAplicado","lexicoAplicado","compMemoriza","compIdeas","compValora","compInterpreta","compAsocia","lecturaCorriente","lecturaSilabica","lecturaVacilante","errorCambioLetras","errorCambioSilabas","errorCambioPalabras","errorOmision","errorAdicion","errorRepeticion","errorRotacion","errorInversion"]
export const classificationSelect = Object.fromEntries(Object.keys(EVALUACION_DEFAULTS).filter(k=>/^(ej|dict_|comp_)/.test(k)||reading.includes(k)).map(k=>[k,true])) as Prisma.EvaluacionSelect
