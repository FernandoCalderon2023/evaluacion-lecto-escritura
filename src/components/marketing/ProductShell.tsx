import Link from "next/link"
import { Logo } from "@/components/branding/Logo"

export function ProductHeader() {
  return <header className="border-b border-slate-200/70 bg-[#fafaf7] print:hidden">
    <nav aria-label="Navegación principal" className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-8">
      <Link href="/" aria-label="SIDEDA, inicio" className="flex items-center gap-3"><Logo size={32} showText={false} /><span className="text-xl font-extrabold tracking-tight text-viria-900">SIDEDA<span className="ml-2 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">por VirIA</span></span></Link>
      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600 sm:gap-7">
        <Link href="/#soluciones" className="hover:text-viria-700">Soluciones</Link>
        <Link href="/demo" className="hover:text-viria-700">Ver ejemplo</Link>
        <Link href="/registro" className="font-semibold text-viria-700">Prueba gratis</Link>
        <Link href="/login" className="rounded-full bg-viria-900 px-5 py-2.5 text-white hover:bg-viria-800">Ingresar</Link>
      </div>
    </nav>
  </header>
}

export function ProductFooter() {
  return <footer className="border-t border-slate-200 bg-[#fafaf7] px-5 py-9 print:hidden">
    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row">
      <div><p className="font-bold text-viria-900">SIDEDA · por VirIA</p><p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">Evaluación y acompañamiento del aprendizaje.<br />Una herramienta de apoyo al criterio profesional.</p></div>
      <nav aria-label="Información del producto" className="flex flex-wrap gap-5 text-xs text-slate-600"><a href="mailto:fcalderon@vir-ia.com">Contacto</a><Link href="/acerca">Acerca de</Link><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos de uso</Link><Link href="/demo">Ejemplo de informe</Link></nav>
    </div>
  </footer>
}
