"use client"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from "recharts"
import { AllScores } from "@/types/scoring"

interface Props { scores: AllScores }

export function GraficoRadar({ scores }: Props) {
  const data = [
    {
      area: "Lectura",
      complete: scores.lectura.registro === "completo",
      valor: Math.round(scores.lectura.comprensionPct),
    },
    {
      area: "Cognitivo",
      valor: Math.round((scores.cognitivo.totalCorrect / scores.cognitivo.totalItems) * 100),
    },
    {
      area: "Léxico",
      valor: Math.round((scores.lexical.totalCorrect / scores.lexical.totalItems) * 100),
    },
    {
      area: "Dictado",
      complete: scores.dictado.registro === "completo",
      valor: Math.round((scores.dictado.positiveTotal / 34) * 100),
    },
    {
      area: "Composición",
      complete: scores.composicion.registro === "completo",
      valor: Math.round((scores.composicion.positiveTotal / 34) * 100),
    },
  ].filter(item => item.complete !== false)

  return (
    <div>
    {data.length < 5 && <p className="text-xs text-slate-500">Gráfico parcial: se omiten las rúbricas incompletas.</p>}
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="area" tick={{ fontSize: 12 }} />
        <Radar
          name="Desempeño (%)"
          dataKey="valor"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.25}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
    </div>
  )
}
