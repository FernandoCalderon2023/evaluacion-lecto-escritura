import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Telemetry } from "@/components/Telemetry"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  metadataBase: new URL("https://sideda.com"),
  title: "SIDEDA | Evaluación y acompañamiento del aprendizaje",
  description: "Organiza evaluaciones de lectoescritura, revisa informes con IA y acompaña a estudiantes y familias. Una herramienta para docentes, profesionales y unidades educativas.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Telemetry />
      </body>
    </html>
  )
}
