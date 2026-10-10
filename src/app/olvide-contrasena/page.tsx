import { ProductHeader, ProductFooter } from "@/components/marketing/ProductShell"
import { RecoveryForm } from "@/components/auth/PasswordForms"
import { emailConfigured } from "@/lib/notifications"
export const dynamic="force-dynamic"
export const metadata={title:"Recuperar acceso | SIDEDA",robots:{index:false,follow:false}}
export default function RecoveryPage(){return <div className="min-h-screen bg-[#fafaf7]"><ProductHeader/><main className="mx-auto max-w-lg px-5 py-14"><h1 className="text-3xl font-semibold">Recupera tu acceso</h1><p className="mb-8 mt-4 text-sm leading-relaxed text-slate-600">Solicita un enlace personal para elegir una nueva contraseña. Por seguridad, el enlace vence a los 30 minutos y solo puede utilizarse una vez.</p><RecoveryForm available={emailConfigured()}/></main><ProductFooter/></div>}
