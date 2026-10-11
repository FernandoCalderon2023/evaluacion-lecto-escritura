"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, ClipboardList, LayoutDashboard, Menu, X, LogOut, Settings, ChevronLeft, BookOpen } from "lucide-react"
import { Logo } from "@/components/branding/Logo"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

const nav = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/evaluaciones", label: "Evaluaciones", icon: ClipboardList },
  { href: "/cuenta", label: "Cuenta", icon: Settings },
  { href: "/guia", label: "Guía de uso", icon: BookOpen },
]

const adminNav = [
  { href: "/admin", label: "Control", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardList },
  { href: "/admin/organizaciones", label: "Organizaciones", icon: BookOpen },
  { href: "/admin/avisos", label: "Avisos", icon: Settings },
]
const isActive = (path: string, href: string) => path === href || (href !== "/admin" && path.startsWith(href + "/"))

const LS_KEY = "sideda-sidebar-collapsed"

export function Sidebar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === "ADMIN"

  const isFamily = (session?.user as any)?.role === "FAMILIA"
  const administration = isAdmin && (path === "/admin" || path.startsWith("/admin/"))
  const home = isFamily ? "/familia" : administration ? "/admin" : "/dashboard"
  const fullNav = isFamily ? [{ href: "/familia", label: "Mi familia", icon: Users }, { href: "/suscripcion", label: "Mi acceso", icon: BookOpen }, { href: "/cuenta", label: "Cuenta", icon: Settings }] : administration ? adminNav : nav

  // Cerrar sidebar al navegar (móvil)
  useEffect(() => { setOpen(false) }, [path])

  // Persistir estado collapsed (desktop)
  useEffect(() => {
    try { if (localStorage.getItem(LS_KEY) === "1") setCollapsed(true) } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, collapsed ? "1" : "0") } catch {}
  }, [collapsed])

  return (
    <>
      {/* === HEADER MÓVIL === */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-viria-900 to-orchid-800 text-white flex items-center justify-between px-4 py-3 shadow-md print:hidden">
        <Link href={home} className="flex items-center gap-2">
          <Logo variant="white" size={22} showText={false} />
          <span className="font-extrabold text-sm tracking-tight">SIDEDA</span>
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-expanded={open}
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
          "fixed lg:sticky z-50 top-0 left-0 h-screen bg-gradient-to-b from-viria-900 via-viria-800 to-orchid-800 text-white flex flex-col transition-all duration-300 ease-out shadow-2xl print:hidden",
          collapsed ? "lg:w-16" : "lg:w-64",
          "w-72",
          "lg:translate-x-0",
          open ? "visible translate-x-0" : "invisible -translate-x-full lg:visible"
        )}
      >
        {/* Logo */}
        <div className={cn("border-b border-white/10 transition-all", collapsed ? "p-3" : "p-5")}>
          <div className={cn("flex items-center gap-2.5", collapsed && "lg:justify-center")}>
            <Logo variant="white" size={collapsed ? 28 : 32} showText={false} />
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="font-extrabold text-base leading-tight tracking-tight bg-clip-text text-transparent bg-ia-gradient">SIDEDA</p>
                <p className="text-[10px] text-viria-300 mt-0.5 truncate">producto de VirIA</p>
              </div>
            )}
          </div>
        </div>

        {isAdmin && <div className={cn("border-b border-white/10", collapsed ? "p-2" : "p-3")}>
          {!collapsed && <p className="mb-2 px-2 text-[10px] uppercase tracking-widest text-viria-200">{administration ? "Administración" : "Evaluación y resultados"}</p>}
          <Link href={administration ? "/dashboard" : "/admin"} title={administration ? "Ir a evaluaciones" : "Ir a administración"} className="flex items-center gap-2 rounded-lg border border-white/20 p-2 text-xs hover:bg-white/10">
            {administration ? <ClipboardList className="h-4 w-4 shrink-0"/> : <Settings className="h-4 w-4 shrink-0"/>}
            <span className={collapsed ? "lg:sr-only" : ""}>{administration ? "Ir a evaluaciones" : "Ir a administración"}</span>
          </Link>
        </div>}
        {/* Nav */}
        <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
          {fullNav.map(({ href, label, icon: Icon }) => {
            const active = isActive(path, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl transition-all",
                  collapsed ? "lg:justify-center p-3" : "gap-3 px-3 py-2.5",
                  active
                    ? "bg-white/15 text-white shadow-md backdrop-blur-sm border border-white/10"
                    : "text-viria-100/80 hover:bg-white/5 hover:text-white"
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
        <div className={cn("border-t border-white/10 space-y-2", collapsed ? "p-2" : "p-3")}>
          {session?.user && !collapsed && (
            <div className="px-2 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5">
              <p className="text-xs font-semibold text-white truncate">{session.user.name}</p>
              <p className="text-[10px] text-viria-200/70 truncate">{session.user.email}</p>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn(
              "flex items-center w-full rounded-lg text-xs text-viria-100/80 hover:text-white hover:bg-white/10 transition-colors",
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
              "hidden lg:flex items-center w-full rounded-lg text-[10px] text-viria-300/60 hover:text-white hover:bg-white/10 transition-colors",
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
          const active = isActive(path, href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg transition-all",
                active ? "text-viria-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "scale-110")} />
              <span className={cn("text-[10px] leading-none", active && "font-semibold")}>
                {href === "/familia" ? "Familia" : href === "/suscripcion" ? "Acceso" : label.split(" ")[0]}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
