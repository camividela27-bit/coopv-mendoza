'use client'

import { useRouter } from 'next/navigation'
import AppHeader from '@/app/components/AppHeader'

export default function ElegirCatalogoPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Catálogo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Elegí qué querés explorar</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/catalogo')}
            className="w-full bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-[#1c2b4b] hover:shadow-sm transition-all"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Amigo a Amigo</p>
            <p className="text-lg font-bold text-gray-900">Productos de Amigo a Amigo</p>
            <p className="text-sm text-gray-500 mt-1">Alimentos, vinos, artesanías, aromas y más de nuestra comunidad</p>
          </button>

          <button
            onClick={() => router.push('/club')}
            className="w-full bg-white border border-gray-200 rounded-2xl p-6 text-left hover:border-[#1c2b4b] hover:shadow-sm transition-all"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#3D6B50] mb-1">Club</p>
            <p className="text-lg font-bold text-gray-900">Productos de Club</p>
            <p className="text-sm text-gray-500 mt-1">Productos disponibles en la sede para retirar el sábado</p>
          </button>
        </div>
      </div>
    </div>
  )
}
