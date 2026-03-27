import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MainLayout } from "@/components/layout/MainLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SPMA-DAEL-E",
  description: "Sistema Psicopedagógico Multidimensional Asistido para la Detección y Análisis Estratégico de Lecto-Escritura",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
