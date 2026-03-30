"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Users, ClipboardList, LayoutDashboard, Menu, X, LogOut, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

const nav = [
  { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/evaluaciones", label: "Evaluaciones", icon: ClipboardList },
]

export function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === "ADMIN"

  const fullNav = isAdmin
    ? [...nav, { href: "/admin", label: "Administración", icon: Settings }]
    : nav

  // Cerrar sidebar al navegar
  useEffect(() => { setOpen(false) }, [path])

  return (
    <>
      {/* Header móvil */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <p className="font-bold text-sm">SIDEDA</p>
        </div>
        <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-slate-800">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay móvil */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static z-50 top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <div>
              <p className="font-bold text-sm leading-tight">SIDEDA</p>
              <p className="text-xs text-slate-400">sideda.com</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {fullNav.map(({ href, label, icon: Icon }) => (
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
        <div className="p-4 border-t border-slate-700 space-y-2">
          {session?.user && (
            <div className="text-xs text-slate-400 truncate">
              {session.user.name}
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Bottom nav para móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex justify-around py-2 px-1 safe-area-pb">
        {fullNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors",
              path.startsWith(href)
                ? "text-blue-600 font-semibold"
                : "text-slate-400"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
