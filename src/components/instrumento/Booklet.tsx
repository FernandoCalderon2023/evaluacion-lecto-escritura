import type { ReactNode } from "react"
import { Activity, Preparation, Reading, Comprehension, Dictation, Composition, ReadingRegister, WritingRegister, ApplicationRegister } from "./Activities"
import { titles, TEMPLATE_VERSION } from "./content"

export function Booklet({ evaluator = false }: { evaluator?: boolean }) {
 const sheets: { title: string; content: ReactNode }[] = evaluator ? [
  { title: "Aplicación y registro de actividades", content: <ApplicationRegister/> },
  { title: "Registro de lectura", content: <ReadingRegister/> },
  { title: "Registro de escritura · Dictado", content: <WritingRegister/> },
  { title: "Registro de escritura · Composición", content: <WritingRegister composition/> },
 ] : [
  { title: "Mi cuadernillo de actividades", content: <Preparation/> },
  { title: "1. Lectura en voz alta", content: <Reading/> },
  { title: "1. Comprensión lectora", content: <Comprehension/> },
  ...[[2,3],[4,5],[6],[7,8],[9,10],[11],[12,13],[14]].map(steps=>({ title: steps.length>1 ? `Actividades ${steps[0]} a ${steps.at(-1)}` : titles[steps[0]], content: <>{steps.map(step=><section className="instrument-print-activity" key={step}>{steps.length>1 && <h3>{titles[step]}</h3>}<Activity step={step}/></section>)}</> })),
  { title: "15. Dictado", content: <Dictation/> },
  { title: "16. Composición", content: <Composition/> },
 ]
 return <div className="instrument-booklet">{sheets.map((sheet,i)=><article className="instrument-sheet" key={sheet.title}>
  <header className="instrument-sheet-brand"><div className="instrument-brand"><img src="/icon.svg" alt="" width="30" height="30"/><strong>SIDEDA</strong></div><span>{evaluator ? "Uso profesional" : "Cuadernillo del estudiante"}</span></header>
  <h2>{sheet.title}</h2>
  {i>0 || evaluator ? <p className="instrument-sheet-id">Nombre o código: __________________________ Fecha: ______________</p> : null}
  <div className="instrument-sheet-content instrument-activity">{sheet.content}</div>
  <footer className="instrument-sheet-footer"><span>{TEMPLATE_VERSION} · Adaptación SIDEDA · Ref. MINEDU Bolivia, 2012</span><span>{i+1} / {sheets.length}</span></footer>
 </article>)}</div>
}
