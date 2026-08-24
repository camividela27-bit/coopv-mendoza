'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/admin/pedidos', label: 'Pedidos', icon: '📋' },
  { href: '/admin/productos', label: 'Productos', icon: '📦' },
  { href: '/admin/fechas', label: 'Fechas', icon: '📅' },
  { href: '/admin/comunicados', label: 'Comunicados', icon: '✉️' },
  { href: '/admin/club', label: 'Club', icon: '🏡' },
  { href: '/admin/reporte', label: 'Reporte', icon: '📊' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="flex flex-col flex-1 justify-between">
      <nav className="space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/55 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        <span>→</span>
        <span>Salir</span>
      </button>
    </div>
  )
}
