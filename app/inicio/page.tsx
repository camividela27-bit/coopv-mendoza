'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InicioPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    const raw = document.cookie
      .split('; ')
      .find(r => r.startsWith('nombre='))
      ?.split('=')[1]
    if (raw) {
      const first = decodeURIComponent(raw).split(' ')[0]
      setNombre(first.charAt(0).toUpperCase() + first.slice(1).toLowerCase())
    }
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1c2b4b] text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-amber-400 font-bold text-xl tracking-wide">COOPV</span>
          <nav className="flex items-center gap-5 text-sm">
            <span className="text-amber-400 font-semibold">Inicio</span>
            <Link href="/catalogo" className="text-white/70 hover:text-white transition-colors">Catálogo</Link>
            <Link href="/pedido" className="text-white/70 hover:text-white transition-colors">Pedido</Link>
            <button onClick={logout} className="text-white/70 hover:text-white transition-colors">Salir</button>
          </nav>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 pb-10">
        {/* Saludo */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">
            {nombre ? `Hola, ${nombre} 👋` : 'Hola 👋'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Bienvenido a la cooperativa</p>
        </div>

        {/* Próximas cooperativas */}
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
          Próximas Cooperativas
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 mb-7">
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-bold text-gray-900">Viernes 7 de agosto</p>
              <p className="text-sm text-gray-500 mt-0.5">Retiro en Sede</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="inline-block bg-[#1c2b4b] text-white text-xs font-semibold px-3 py-1 rounded-full">
                Sede
              </span>
              <p className="text-xs text-gray-400 mt-1.5">Cierra 4 ago</p>
            </div>
          </div>
          <div className="p-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-bold text-gray-900">Sábado 15 de agosto</p>
              <p className="text-sm text-gray-500 mt-0.5">Retiro en Club de Campo</p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                Club
              </span>
              <p className="text-xs text-gray-400 mt-1.5">Cierra 12 ago</p>
            </div>
          </div>
        </div>

        {/* Avisos */}
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
          Avisos
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 mb-8">
          <div className="p-4">
            <p className="font-semibold text-gray-900 leading-snug">🍷 Vino JUNTOS disponible</p>
            <p className="text-sm text-gray-500 mt-1">
              Individual y en caja de 6 unidades. ¡Encontralo en el catálogo!
            </p>
          </div>
          <div className="p-4">
            <p className="font-semibold text-gray-900 leading-snug">📦 Nuevos productos de Amigos</p>
            <p className="text-sm text-gray-500 mt-1">
              Se sumaron más productos y variedades en los productos.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/catalogo')}
          className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-amber-700 transition-colors"
        >
          Hacer mi pedido →
        </button>
      </div>
    </div>
  )
}
