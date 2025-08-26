import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TechMo: Simulación de Crédito",
  description: "Herramienta para simulaciones de crédito personalizadas con las mejores condiciones del mercado",
  openGraph: {
    title: "TechMo: Simulación de Crédito",
    description: "Herramienta para simulaciones de crédito personalizadas con las mejores condiciones del mercado",
    type: "website",
    siteName: "TechMo Créditos",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "TechMo - Simulación de Crédito",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechMo: Simulación de Crédito",
    description: "Herramienta para simulaciones de crédito personalizadas con las mejores condiciones del mercado",
    images: ["/opengraph-image"],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
