"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

interface Props {
  endpoint: string
  redirectTo: string
  label?: string
  confirmMessage?: string
}

export function DeleteButton({ endpoint, redirectTo, label = "Eliminar", confirmMessage = "¿Estás seguro? Esta acción no se puede deshacer." }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(confirmMessage)) return
    setLoading(true)
    try {
      const res = await fetch(endpoint, { method: "DELETE" })
      if (!res.ok) throw new Error()
      router.push(redirectTo)
      router.refresh()
    } catch {
      alert("Error al eliminar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {loading ? "Eliminando..." : label}
    </button>
  )
}
