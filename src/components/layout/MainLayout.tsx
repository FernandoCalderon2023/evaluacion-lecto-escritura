import { Sidebar } from "./Sidebar"
import { Toaster } from "@/components/ui/toaster"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-14 pb-16 lg:pt-0 lg:pb-0">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
