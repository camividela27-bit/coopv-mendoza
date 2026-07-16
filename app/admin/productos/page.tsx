'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Producto } from '@/lib/types'

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/productos')
      .then(r => r.json())
      .then((data: Producto[]) => { setProductos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function toggleDisponible(id: string, current: boolean) {
    setToggling(id)
    try {
      const res = await fetch(`/api/admin/productos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible: !current }),
      })
      if (res.ok) {
        setProductos(prev =>
          prev.map(p => p.id === id ? { ...p, disponible: !current } : p)
        )
      }
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    )
  }

  const disponibles = productos.filter(p => p.disponible)
  const noDisponibles = productos.filter(p => !p.disponible)

  return (
    <div className="min-h-screen">
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin" className="text-2xl text-white/70 hover:text-white">‹</Link>
          <div>
            <p className="text-xs text-amber-400 font-bold tracking-wider uppercase">Admin</p>
            <h1 className="font-bold text-lg">Gestionar productos</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {productos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-gray-600 font-medium">No hay productos cargados.</p>
            <p className="text-gray-400 text-sm mt-1">Agregá productos desde el panel de Supabase.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">
              {disponibles.length} disponibles · {noDisponibles.length} ocultos
            </p>

            <div className="space-y-2.5">
              {productos.map(producto => (
                <div
                  key={producto.id}
                  className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-opacity ${
                    !producto.disponible ? 'opacity-60 border-gray-200' : 'border-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold leading-snug ${producto.disponible ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                      {producto.nombre}
                    </p>
                    {producto.productor && (
                      <p className="text-sm text-gray-400">{producto.productor}</p>
                    )}
                    <p className="text-sm font-medium text-blue-900 mt-0.5">
                      ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleDisponible(producto.id, producto.disponible)}
                    disabled={toggling === producto.id}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                      producto.disponible
                        ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    } disabled:opacity-50`}
                  >
                    {toggling === producto.id
                      ? '...'
                      : producto.disponible
                        ? 'Ocultar'
                        : 'Activar'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
