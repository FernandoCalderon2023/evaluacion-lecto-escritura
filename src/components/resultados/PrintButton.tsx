"use client"
import { Printer } from "lucide-react"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-lg text-sm hover:bg-slate-50 text-slate-600"
    >
      <Printer className="h-4 w-4" />
      Imprimir / PDF
    </button>
  )
}
