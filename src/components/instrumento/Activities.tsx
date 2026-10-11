import { Illustration, SpatialFigures } from "./Illustration"
import { comprehension, reading, SOURCE, TEMPLATE_VERSION, writingErrors, writingQuality } from "./content"

export function Lines({ count = 2 }: { count?: number }) {
 return <div className="answer-lines" aria-label="Espacio para responder en papel">{Array.from({ length: count }, (_, i) => <div key={i}/>)}</div>
}
function Questions({ items, lines = 1 }: { items: string[]; lines?: number }) {
 return <ol className="instrument-questions">{items.map((q,i)=><li key={q}><p><strong>{i+1}.</strong> {q}</p><Lines count={lines}/></li>)}</ol>
}
export function Preparation() {
 return <div className="instrument-preparation">
  <p className="instrument-eyebrow">SIDEDA · Cuadernillo del estudiante</p>
  <h2>Lectura, palabras y escritura</h2>
  <p>Lee cada consigna con atención. Responde por ti mismo y avisa al responsable si necesitas que te explique cómo realizar una actividad.</p>
  <div className="instrument-fields">{["Nombre o código del estudiante", "Curso y edad", "Unidad educativa", "Fecha", "Responsable de la aplicación"].map(label=><div key={label}><strong>{label}</strong><Lines count={1}/></div>)}</div>
  <h3>Quién participa</h3>
  <ul className="instrument-participants"><li><strong>Estudiante:</strong> lee, responde y realiza las actividades.</li><li><strong>Mamá, papá o tutor:</strong> puede acompañar, preparar el espacio y aportar observaciones. No necesita participar más de un familiar. No responde ni corrige por el estudiante.</li><li><strong>Docente o evaluador:</strong> aplica las consignas y registra lo observado en SIDEDA.</li><li><strong>Psicopedagogo:</strong> revisa el dictado, la composición y su valoración profesional.</li></ul>
  <p className="instrument-source">{SOURCE} Versión {TEMPLATE_VERSION}. Adaptación de presentación, con ilustraciones nuevas; no constituye una nueva prueba validada ni un diagnóstico.</p>
 </div>
}
export function Reading() {
 return <div className="instrument-reading"><p>Lee el siguiente texto en voz alta.</p><h3>El Pajarito intoxicado</h3>{reading.map(p=><p key={p}>{p}</p>)}</div>
}
export function Comprehension() { return <Questions items={comprehension} lines={2}/> }

export function Activity({ step }: { step: number }) {
 switch(step) {
  case 0: return <Preparation/>
  case 1: return <><Reading/><h3>Preguntas de comprensión</h3><Comprehension/></>
  case 2: return <><p>Completa las letras que faltan para escribir el nombre de cada dibujo.</p><div className="instrument-picture-grid">{[["bicycle","Bici _ _ _ ta"],["butterfly","Mari _ osa"],["fish","p _ _"]].map(([kind,text],i)=><div className="instrument-picture" key={kind}><Illustration kind={kind} label={`Dibujo ${i+1}`}/><p>{text}</p></div>)}</div></>
  case 3: return <><p>Escribe el nombre de cada dibujo. Después explica para qué se utiliza.</p><div className="instrument-picture-grid">{["desk","horse","shoes"].map((kind,i)=><div className="instrument-picture" key={kind}><Illustration kind={kind} label={`Objeto ${i+1}`}/><p>{i+1}. Nombre:</p><Lines count={1}/><p>¿Para qué sirve?</p><Lines count={2}/></div>)}</div></>
  case 4: return <><p>Lee y realiza la acción indicada.</p><p><strong>a)</strong> Encierra en un círculo al de mayor tamaño.</p><div className="instrument-sentence">El <Illustration kind="bird" label="Pájaro"/> es más grande que el <Illustration kind="rabbit" label="Conejo"/>.</div><p><strong>b)</strong> Subraya el más pequeño.</p><div className="instrument-sentence">El <Illustration kind="cat" label="Gato"/> es más pequeño que la <Illustration kind="cow" label="Vaca"/>.</div></>
  case 5: return <><p><strong>A.</strong> Encierra las frutas en un círculo, los animales en un cuadrado y subraya los útiles deportivos.</p><div className="instrument-classify">{["fish","orange","grapes","ball","rooster"].map((kind,i)=><Illustration key={kind} kind={kind} label={`Imagen ${i+1} para clasificar`}/>)}</div><p><strong>B.</strong> Si ahora es de noche, pon una equis (X) roja dentro del cuadro blanco. Si es de día, pon una cruz (+) verde encima del cuadro negro.</p><div className="instrument-squares"><svg viewBox="0 0 360 150" role="img" aria-label="Cuadro blanco y cuadro negro"><path d="M30 45h95v95H30Z" fill="white" stroke="black" strokeWidth="3"/><path d="M235 45h95v95H235Z" fill="black"/></svg></div></>
  case 6: return <><p>Observa las figuras y realiza las acciones.</p><ol className="instrument-directions"><li>Dibuja una cruz (+) en el círculo al lado izquierdo del rectángulo negro.</li><li>Dibuja una cruz (+) debajo del rectángulo que tiene encima un círculo blanco.</li><li>Dibuja una cruz (+) a la derecha de los círculos negros unidos.</li></ol><SpatialFigures/></>
  case 7: return <><p>«Yo juego después de hacer la tarea». ¿Qué haces primero?</p><Lines count={2}/></>
  case 8: return <><p>Completa cada oración con las palabras que correspondan.</p><p className="instrument-wordbank">Vuela · salta · canta · se arrastra · cortar papeles · dibujar · juega · pintar</p><Questions items={["En la clase utilizo las tijeras para…", "El perro…", "El pájaro…", "El lagarto…"]}/></>
  case 9: return <><p>Ordena las letras para formar palabras con significado.</p><Questions items={["rañeba", "llónsi", "mónli", "ranjana"]}/></>
  case 10: return <Questions items={["El niño tomó leche y se quemó. ¿Cómo estaba la leche?", "Tomaste agua en un vaso y se te enfriaron los labios. ¿Cómo estaba el agua?", "Jorge ayuda a su mamá. ¿Cómo es Jorge?"]}/>
  case 11: return <><p><strong>A.</strong> «Mesa» y «presa» riman. Escribe una palabra que rime con cada una:</p><Questions items={["oca", "tetera", "Ada", "teja"]}/><p><strong>B.</strong> Marca la palabra que no rima en cada grupo.</p><ol className="instrument-choices">{["sal · mar · cal", "mitad · ciudad · cantar", "maíz · raíz · rosal", "cantar · saltar · baila"].map((s,i)=><li key={s}>{i+1}. {s}</li>)}</ol></>
  case 12: return <><p>Cambia la letra indicada y escribe la palabra que resulta.</p><Questions items={['En «mesa», quita la «e» y pon «i».','En «casa», quita la primera «a» y pon «o».','En «solo», quita la última «o» y pon «a».']}/></>
  case 13: return <><p>Escribe la palabra que resulta al quitar la letra indicada.</p><Questions items={['A «toro», quítale la «t».','A «dama», quítale la «d».','A «rana», quítale la «r».']}/></>
  case 14: return <><p>La sílaba contraria de «no» es «on». Escribe la contraria de:</p><Questions items={["el", "se", "ed"]}/></>
  case 15: return <><h3>15. Dictado</h3><Dictation/><h3>16. Composición</h3><Composition/></>
  default: return <p>La batería psicomotora se aplica con su protocolo profesional. Este cuadernillo solo contiene actividades de lectoescritura; no sustituye las consignas de BPM.</p>
 }
}
export function Dictation() { return <><p>Escribe lo que te dicte el responsable de la aplicación.</p><Lines count={16}/></> }
export function Composition() { return <><p>Escribe una redacción titulada:</p><h3>Mis bonitas vacaciones</h3><Lines count={18}/></> }

function RegisterTable({ rows, options }: { rows: string[]; options: string[] }) {
 return <table className="instrument-register"><thead><tr><th scope="col">Criterio observado</th>{options.map(o=><th scope="col" key={o}>{o}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row}><th scope="row">{row}</th>{options.map(o=><td key={o}>□</td>)}</tr>)}</tbody></table>
}
export function ReadingRegister() { return <><p>Uso exclusivo del evaluador. No entregar durante las actividades. Transfiere los resultados al registro de SIDEDA; deja pendiente lo que no se aplicó.</p><p>Palabras leídas en 4 minutos: __________</p><RegisterTable rows={["Lectura vacilante", "Lectura silábica", "Lectura corriente", "Memoriza aspectos significativos", "Establece ideas centrales y secundarias", "Valora el contenido", "Interpreta", "Asocia con otros contextos"]} options={["S","CS","AV","N"]}/><p>S: siempre · CS: casi siempre · AV: a veces · N: no.</p><RegisterTable rows={["Cambio de letras", "Cambio de sílabas", "Cambio de palabras", "Omisión", "Adición", "Repetición", "Rotación", "Inversión"]} options={["Inicio","Medio","Final"]}/><p>Registra los aciertos por inciso de los ejercicios 2–14 en SIDEDA. Confirma un bloque solo cuando hayas aplicado todos sus ejercicios.</p><p>Observaciones y condiciones de aplicación:</p><Lines count={3}/></> }
export function WritingRegister({ composition = false }: { composition?: boolean }) { return <><p>Revisión del psicopedagogo · {composition ? "Composición" : "Dictado"}. Deja en blanco los criterios no valorados.</p><RegisterTable rows={writingErrors} options={["S","CS","AV","N"]}/><p>S: siempre presenta el error · CS: casi siempre · AV: a veces · N: nunca.</p><RegisterTable rows={writingQuality} options={["B","R","M"]}/><p>B: bien · R: regular · M: necesita mejorar.</p><p>Responsable de revisión / fecha: __________________________</p><Lines count={1}/></> }

export function ApplicationRegister() { return <><p>Completa esta hoja antes y durante la aplicación. No se entrega al estudiante.</p><h3>Dictado: preparación profesional</h3><p>La fuente aportada no fija un texto de dictado. El profesional debe seleccionarlo y registrar su fuente y condiciones de aplicación.</p><p>Texto dictado / fuente (adjunta una hoja si necesitas más espacio):</p><Lines count={2}/><h3>Registro de actividades</h3><p>Marca únicamente los incisos correctos, después de aplicar la actividad completa. Si queda pendiente, anótalo en observaciones y no confirmes el bloque en SIDEDA.</p><table className="instrument-register"><thead><tr><th>Actividad</th><th>Registro por inciso</th></tr></thead><tbody>{["2 · Letras: bicicleta __/3 · mariposa __/1 · pez __/2", "3A · Nombra: 1 □ 2 □ 3 □", "3B · Explica: 1 □ 2 □ 3 □", "4 · Instrucciones: a □ b □", "5 · Frutas □ Animales □ Deportes □ Día/noche □", "6 · Orientación: a □ b □ c □", "7 · Secuencia □", "8 · Asociación: a □ b □ c □ d □", "9 · Ordenar letras: a □ b □ c □ d □", "10 · Inferencia: a □ b □ c □", "11A · Produce rimas: 1 □ 2 □ 3 □ 4 □", "11B · No rima: 1 □ 2 □ 3 □ 4 □", "12 · Sustitución: a □ b □ c □", "13 · Omisión: a □ b □ c □", "14 · Inversión: a □ b □ c □"].map(row=><tr key={row}><td colSpan={2} style={{textAlign:"left"}}>{row}</td></tr>)}</tbody></table><p>Observaciones / actividades pendientes:</p><Lines count={1}/></> }
