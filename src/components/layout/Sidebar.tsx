"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Users, ClipboardList, LayoutDashboard } from "lucide-react"

const nav = [
  { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/evaluaciones", label: "Evaluaciones", icon: ClipboardList },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-400" />
          <div>
            <p className="font-bold text-sm leading-tight">SPMA-DAEL-E</p>
            <p className="text-xs text-slate-400">Sistema Psicopedagógico</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              path.startsWith(href)
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        Ministerio de Educación · Bolivia 2012
      </div>
    </aside>
  )
}
