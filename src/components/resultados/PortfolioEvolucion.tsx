"use client"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"

interface Punto {
  fecha: string
  cognitivo: number | null
  lexical: number | null
  comprension: number | null
}

/** Evolución de los puntajes del estudiante a lo largo de sus evaluaciones. */
export function PortfolioEvolucion({ data }: { data: Punto[] }) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        Se necesitan al menos 2 evaluaciones para graficar la evolución.
      </p>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -14 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="cognitivo" name="Cognitivo (/27)" stroke="#0f6e78" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line type="monotone" dataKey="lexical" name="Léxico (/17)" stroke="#474da0" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        <Line type="monotone" dataKey="comprension" name="Comprensión" stroke="#c97a2b" strokeWidth={2} dot={{ r: 3 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  )
}
