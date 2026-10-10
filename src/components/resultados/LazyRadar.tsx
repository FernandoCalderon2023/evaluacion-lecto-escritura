"use client"
import dynamic from "next/dynamic"
export const LazyRadar = dynamic(() => import("./GraficoRadar").then(m => m.GraficoRadar), {
 ssr: false,
 loading: () => <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">Cargando gráfico...</div>,
})
