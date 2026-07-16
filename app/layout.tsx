import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'COOPV Mendoza',
  description: 'Unidad de Abastecimiento · Cooperativa PRÓ-VIDA Mendoza',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  )
}
