"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Users, ClipboardList, LayoutDashboard, Menu, X, LogOut, Settings, ChevronLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

const nav = [
  { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/evaluaciones", label: "Evaluaciones", icon: ClipboardList },
]

const LS_KEY = "sideda-sidebar-collapsed"

export function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === "ADMIN"

  const fullNav = isAdmin
    ? [...nav, { href: "/admin", label: "Administración", icon: Settings }]
    : nav

  // Cerrar sidebar al navegar (móvil)
  useEffect(() => { setOpen(false) }, [path])

  // Persistir estado collapsed (desktop)
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved === "1") setCollapsed(true)
  }, [])
  useEffect(() => {
    localStorage.setItem(LS_KEY, collapsed ? "1" : "0")
  }, [collapsed])

  return (
    <>
      {/* === HEADER MÓVIL === */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white flex items-center justify-between px-4 py-3 shadow-md print:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight">SIDEDA</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* === OVERLAY MÓVIL === */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity print:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* === SIDEBAR === */}
      <aside
        className={cn(
          "fixed lg:sticky z-50 top-0 left-0 h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col transition-all duration-300 ease-out shadow-2xl print:hidden",
          collapsed ? "lg:w-16" : "lg:w-64",
          "w-72",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className={cn("border-b border-slate-800/60 transition-all", collapsed ? "p-3" : "p-5")}>
          <div className={cn("flex items-center gap-2.5", collapsed && "lg:justify-center")}>
            <div className="bg-blue-600 p-2 rounded-xl shrink-0 shadow-lg shadow-blue-600/30">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="font-bold text-base leading-tight tracking-tight">SIDEDA</p>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">sideda.com</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
          {fullNav.map(({ href, label, icon: Icon }) => {
            const active = path.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl transition-all",
                  collapsed ? "lg:justify-center p-3" : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                )}
              >
                <Icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
                {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
                {collapsed && (
                  <span className="lg:hidden text-sm font-medium">{label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer: user + acciones */}
        <div className={cn("border-t border-slate-800/60 space-y-2", collapsed ? "p-2" : "p-3")}>
          {session?.user && !collapsed && (
            <div className="px-2 py-2 rounded-lg bg-slate-800/40">
              <p className="text-xs font-semibold text-white truncate">{session.user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{session.user.email}</p>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex items-center w-full rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors",
              collapsed ? "lg:justify-center p-3" : "gap-2 px-3 py-2"
            )}
            title={collapsed ? "Cerrar sesión" : undefined}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
            {collapsed && <span className="lg:hidden">Cerrar sesión</span>}
          </button>

          {/* Collapse toggle (solo desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex items-center w-full rounded-lg text-[10px] text-slate-500 hover:text-white hover:bg-slate-800 transition-colors",
              collapsed ? "justify-center p-2.5" : "gap-2 px-3 py-2"
            )}
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            <ChevronLeft className={cn("h-3.5 w-3.5 shrink-0 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Colapsar</span>}
          </button>
        </div>
      </aside>

      {/* === BOTTOM NAV MÓVIL === */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around py-2 px-1 safe-area-pb shadow-[0_-2px_10px_rgba(0,0,0,0.04)] print:hidden">
        {fullNav.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all",
                active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              <span className={cn("text-[10px] leading-none", active && "font-semibold")}>
                {label.split(" ")[0]}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
