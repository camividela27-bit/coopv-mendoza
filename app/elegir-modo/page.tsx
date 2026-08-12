'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ElegirModoPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    const raw = document.cookie
      .split('; ')
      .find(r => r.startsWith('nombre='))
      ?.split('=')[1]
    if (raw) setNombre(decodeURIComponent(raw))
  }, [])

  return (
    <div className="min-h-screen bg-[#1c2b4b] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <p className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-2">
              COOPV MENDOZA
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {nombre ? `Hola, ${nombre} 👋` : 'Bienvenido'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">¿Cómo querés entrar?</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/inicio')}
              className="w-full border-2 border-gray-200 rounded-xl p-5 text-left hover:border-[#1c2b4b] hover:bg-slate-50 transition-all group"
            >
              <div className="text-2xl mb-2">👤</div>
              <p className="font-bold text-gray-900 text-base group-hover:text-[#1c2b4b]">
                Entrar como socio
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Ver catálogo y hacer mi pedido
              </p>
            </button>

            <button
              onClick={() => router.push('/admin')}
              className="w-full border-2 border-amber-200 rounded-xl p-5 text-left hover:border-amber-500 hover:bg-amber-50 transition-all group"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <p className="font-bold text-gray-900 text-base group-hover:text-amber-700">
                Panel de administración
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Gestionar pedidos, productos y fechas
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
