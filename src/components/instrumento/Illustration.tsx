import type { ReactNode } from "react"

// Original, scalable line drawings; no raster pages or PDF assets.
const drawings: Record<string, ReactNode> = {
 bicycle: <><circle cx="27" cy="70" r="19"/><circle cx="96" cy="70" r="19"/><path d="m27 70 20-37 21 37H27l18-27h38l13 27-19-48h14M38 32h20M65 70l18-27"/></>,
 butterfly: <><path d="M60 42C20 0 3 31 17 55 0 88 44 107 60 59c16 48 60 29 43-4C117 31 100 0 60 42Z" fill="#e5d9f5"/><path d="M60 38v42m0-42-10-16m10 16 10-16"/><circle cx="60" cy="39" r="5" fill="#111827"/></>,
 fish: <><path d="M18 53C40 14 86 16 98 53 86 90 40 92 18 53L5 32v42Z" fill="#ddedf0"/><path d="m50 28 12-14 15 18M51 79l13 14 13-16M77 36q-15 17 0 34"/><circle cx="87" cy="48" r="3" fill="#111827"/></>,
 desk: <><path d="M12 35h97v17H12Zm8 17v43m79-43v43M70 52v33h29M70 67h29" fill="#f4e8d5"/><path d="M32 34V12h48v22M37 18h38M38 25h20"/></>,
 horse: <><path d="m25 51 9-14 41 3 10-20 5-13 7 12 15 15-7 13-15-3-7 20-2 34H70l-3-30H44l-5 30H28l2-35-9-5-8 14-5-5 6-23Z" fill="#eadbca"/><path d="m77 40 7-21m-5 25 9-21"/><circle cx="98" cy="29" r="2" fill="#111827"/></>,
 shoes: <><path d="M16 48h24l9 9 32 8q13 6 7 18H10V65ZM41 34h22l7 10 30 7q13 4 8 16H87M10 76h77M28 56l15-4M33 64l14-5M59 44l8-3" fill="#e1e6f0"/></>,
 bird: <><path d="M22 65 6 37l29 12c-2-27 43-32 49-11l23 9-23 9c-10 33-52 36-62 9Z" fill="#c5e4f5"/><path d="M31 52q16 26 35 0M47 82v13m17-14v14M40 95h14m3 0h14"/><circle cx="72" cy="39" r="3" fill="#111827"/></>,
 rabbit: <><ellipse cx="56" cy="72" rx="32" ry="23" fill="#fafafa"/><ellipse cx="82" cy="28" rx="7" ry="23"/><ellipse cx="96" cy="29" rx="7" ry="22"/><circle cx="86" cy="53" r="18" fill="#fafafa"/><circle cx="19" cy="65" r="10"/><path d="M38 93h33m25-38 10 3-10 4"/><circle cx="91" cy="49" r="2" fill="#111827"/></>,
 cat: <><path d="M45 46 42 14l18 15 15-15 1 32q16 12 8 34l-4 17H39l-3-24q-23 5-25-12" fill="#f6dfbd"/><path d="M48 43h2m14 0h2M53 52l5 4 5-4M41 53H23m18 6H25m48-6h18M73 59h17M54 78v19m13-19v19"/></>,
 cow: <><path d="M17 38h60l9-12 21 3 6 14-10 21-18-5-8 9v29H67V72H38v25H26V67l-9-6Z" fill="#fff"/><path d="M17 40 9 68M88 28l-8-11m23 12 10-10M38 40q25-1 11 23H35Z" fill="#111827"/><ellipse cx="99" cy="57" rx="12" ry="8" fill="#ead9d9"/><circle cx="94" cy="41" r="2"/><circle cx="106" cy="42" r="2"/></>,
 orange: <><circle cx="58" cy="60" r="35" fill="#f5b85d"/><path d="M58 25V10q20-10 28 4-16 13-28 5M36 49q-6 10-4 19"/></>,
 grapes: <><path d="M57 27 64 7m-5 16q17-18 30-5-13 16-30 5" fill="#d5e6bf"/>{[[40,37],[ 60,37],[80,37],[31,53],[51,54],[72,55],[90,54],[42,71],[62,72],[79,72],[52,88],[69,88],[60,101]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="10" fill="#d9bfdf"/>)}</>,
 rooster: <><path d="M38 61Q4 63 13 20l23 18Q31 10 51 14l6 30 20 6 1-22q1-15 15-9l8 16 11 6-12 8-5 22q-14 21-40 12Z" fill="#ecdbc6"/><path d="m79 20-4-12 13 4 6-9 6 16M63 83v16m16-18v18M55 99h18m-1 0h16M43 55q13 22 30 7"/><circle cx="91" cy="32" r="2" fill="#111827"/></>,
 ball: <><circle cx="60" cy="56" r="42"/><path d="m60 36 20 15-8 23H48l-8-23Zm0-22v22m-40 4 20 11m-6 37 14-14m38 14L72 74m28-34L80 51"/><path d="m60 36 20 15-8 23H48l-8-23Z" fill="#111827"/></>,
 scissors: <><circle cx="30" cy="80" r="15"/><circle cx="83" cy="80" r="15"/><path d="m40 69 45-58-19 48 8 11M72 69 27 11l19 48-8 11"/><circle cx="56" cy="56" r="4"/></>,
}
export function Illustration({ kind, label, className = "" }: { kind: string; label?: string; className?: string }) {
 return <svg viewBox="0 0 120 115" role="img" aria-label={label ?? "Dibujo para identificar"} className={`instrument-illustration ${className}`} fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">{drawings[kind]}</svg>
}

export function SpatialFigures() {
 return <svg viewBox="0 0 420 480" role="img" aria-label="Cuadro de figuras geométricas para el ejercicio de orientación" className="instrument-spatial" fill="white" stroke="black" strokeWidth="3">
  <circle cx="340" cy="42" r="27"/><circle cx="340" cy="115" r="27" fill="black"/><circle cx="340" cy="171" r="27" fill="black"/><circle cx="340" cy="235" r="27"/><circle cx="340" cy="298" r="27" fill="black"/>
  <circle cx="70" cy="150" r="34"/><path d="M145 138h122v64H145z" fill="black"/>
  <ellipse cx="70" cy="262" rx="50" ry="30" fill="black"/><ellipse cx="236" cy="262" rx="51" ry="30"/><ellipse cx="269" cy="343" rx="68" ry="30"/>
  <circle cx="79" cy="349" r="28"/><path d="M20 400h122v72H20Zm185 0h122v72H205Z"/>
 </svg>
}
