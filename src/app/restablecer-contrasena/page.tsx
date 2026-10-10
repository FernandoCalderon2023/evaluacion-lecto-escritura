import { ProductHeader, ProductFooter } from "@/components/marketing/ProductShell"
import { PasswordForm } from "@/components/auth/PasswordForms"
export const metadata={title:"Nueva contraseña | SIDEDA",robots:{index:false,follow:false},referrer:"no-referrer" as const}
export default function ResetPage(){return <div className="min-h-screen bg-[#fafaf7]"><ProductHeader/><main className="mx-auto max-w-lg px-5 py-14"><h1 className="mb-8 text-3xl font-semibold">Elige una nueva contraseña</h1><PasswordForm mode="reset"/></main><ProductFooter/></div>}
