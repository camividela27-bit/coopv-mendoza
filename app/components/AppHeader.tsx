'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/inicio', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/club', label: 'Club' },
  { href: '/pedido', label: 'Pedido' },
]

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('coopv-cart')
    router.push('/login')
  }

  return (
    <header className="bg-[#1c2b4b] text-white sticky top-0 z-10 shadow-md">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <span className="text-amber-400 font-bold text-xl tracking-wide">COOPV</span>
        <nav className="flex items-center gap-5 text-sm">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={
                pathname === href
                  ? 'text-amber-400 font-semibold'
                  : 'text-white/70 hover:text-white transition-colors'
              }
            >
              {label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="text-white/70 hover:text-white transition-colors"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  )
}
