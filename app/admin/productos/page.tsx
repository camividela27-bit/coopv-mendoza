'use client'

import { useState, useEffect } from 'react'
import type { Producto } from '@/lib/types'

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/admin/productos')
      .then(r => r.json())
      .then((data: Producto[]) => {
        setProductos(data)
        const drafts: Record<string, string> = {}
        for (const p of data) {
          drafts[p.id] = p.stock != null ? String(p.stock) : ''
        }
        setStockDraft(drafts)
        setLoading(false)
      })
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

  async function saveStock(id: string) {
    const raw = stockDraft[id]
    const stock = raw === '' ? null : parseInt(raw, 10)
    if (raw !== '' && isNaN(stock as number)) return

    const res = await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    })
    if (res.ok) {
      setProductos(prev =>
        prev.map(p => p.id === id ? { ...p, stock } : p)
      )
    }
  }

  function getStatus(p: Producto) {
    if (!p.disponible) return 'oculto'
    if (p.stock === 0) return 'sin_stock'
    return 'disponible'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando productos...</p>
      </div>
    )
  }

  const disponibles = productos.filter(p => p.disponible).length

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-bold text-gray-900 text-lg">
            Productos ({productos.length})
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {disponibles} disponibles · {productos.length - disponibles} ocultos
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
        <p className="text-xs text-blue-700">
          Ingresá la cantidad disponible en <strong>Stock</strong>. Dejalo vacío para stock ilimitado. Con 0 aparece como "Sin stock" en el catálogo.
        </p>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-gray-500">No hay productos cargados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {productos.map(producto => {
            const status = getStatus(producto)
            return (
              <div
                key={producto.id}
                className={`bg-white rounded-2xl border p-4 ${
                  !producto.disponible ? 'opacity-60 border-gray-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-semibold leading-snug ${!producto.disponible ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {producto.nombre}
                      </p>
                      {status === 'disponible' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Disponible
                        </span>
                      )}
                      {status === 'sin_stock' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          Sin stock
                        </span>
                      )}
                      {status === 'oculto' && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                          Oculto
                        </span>
                      )}
                    </div>
                    {producto.productor && (
                      <p className="text-xs text-gray-400 mt-0.5">{producto.productor}</p>
                    )}
                    <p className="text-sm font-semibold text-[#1c2b4b] mt-1">
                      ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleDisponible(producto.id, producto.disponible)}
                      disabled={toggling === producto.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
                        producto.disponible
                          ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                          : 'bg-[#1c2b4b] text-white hover:bg-[#243764]'
                      }`}
                    >
                      {toggling === producto.id ? '...' : producto.disponible ? 'Ocultar' : 'Activar'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-gray-400">Stock</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="∞"
                        value={stockDraft[producto.id] ?? ''}
                        onChange={e => setStockDraft(prev => ({ ...prev, [producto.id]: e.target.value }))}
                        onBlur={() => saveStock(producto.id)}
                        onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1c2b4b]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
