'use client'

import { useEffect, useState } from 'react'
import AppHeader from '@/app/components/AppHeader'

interface Novedad {
  id: string
  titulo: string
  descripcion: string | null
  imagen_url: string | null
  etiqueta: string | null
}

export default function ClubPage() {
  const [novedades, setNovedades] = useState<Novedad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/novedades')
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setNovedades(data as Novedad[]) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <AppHeader />
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">En el Club</h1>
          <p className="text-sm text-gray-500 mt-0.5">Productos y promociones disponibles en persona</p>
        </div>

        {novedades.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏡</p>
            <p className="text-gray-500 font-medium">Pronto habrá novedades del club.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {novedades.map(n => (
              <div key={n.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {n.imagen_url && (
                  <img
                    src={n.imagen_url}
                    alt={n.titulo}
                    className="w-full object-cover"
                    style={{ maxHeight: '260px' }}
                  />
                )}
                <div className="p-4">
                  {n.etiqueta && (
                    <span className="inline-block text-xs font-semibold bg-[#1c2b4b] text-white px-2.5 py-1 rounded-full mb-2">
                      {n.etiqueta}
                    </span>
                  )}
                  <p className="font-bold text-gray-900 text-base leading-snug">{n.titulo}</p>
                  {n.descripcion && (
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{n.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
