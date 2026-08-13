'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/app/components/AppHeader'
import type { Producto, CartItem } from '@/lib/types'

const CART_KEY = 'coopv-cart'

export default function CatalogoPage() {
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      try { setCart(JSON.parse(saved)) } catch { /* ignore */ }
    }

    fetch('/api/productos')
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setProductos(data as Producto[]) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const saveCart = useCallback((updated: Record<string, CartItem>) => {
    localStorage.setItem(CART_KEY, JSON.stringify(updated))
    setCart(updated)
  }, [])

  function updateQty(producto: Producto, delta: number) {
    const current = cart[producto.id]?.cantidad ?? 0
    const next = Math.max(0, current + delta)
    if (next === 0) {
      const { [producto.id]: _, ...rest } = cart
      saveCart(rest)
    } else {
      saveCart({
        ...cart,
        [producto.id]: {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          productor: producto.productor,
          cantidad: next,
        },
      })
    }
  }

  const productosFiltrados = busqueda.trim()
    ? productos.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.productor ?? '').toLowerCase().includes(busqueda.toLowerCase())
      )
    : productos

  const cartValues = Object.values(cart)
  const totalItems = cartValues.reduce((s, i) => s + i.cantidad, 0)
  const totalPesos = cartValues.reduce((s, i) => s + i.precio * i.cantidad, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <AppHeader />

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="relative mb-4">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Buscar producto o productor..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b]"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
            >
              ×
            </button>
          )}
        </div>

        <div className="space-y-2.5">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-gray-600 font-medium">
            {busqueda ? 'Sin resultados para esa búsqueda.' : 'No hay productos disponibles por ahora.'}
          </p>
          </div>
        ) : (
          productosFiltrados.map(producto => {
            const qty = cart[producto.id]?.cantidad ?? 0
            const sinStock = producto.stock === 0
            return (
              <div
                key={producto.id}
                className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${
                  sinStock ? 'border-gray-100 opacity-60' : 'border-gray-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 leading-snug">{producto.nombre}</p>
                    {sinStock && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        Sin stock
                      </span>
                    )}
                  </div>
                  {producto.detalles && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{producto.detalles}</p>
                  )}
                  {producto.productor && (
                    <p className="text-xs text-gray-400 truncate">{producto.productor}</p>
                  )}
                  <p className="text-[#1c2b4b] font-bold mt-1 text-lg">
                    ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </p>
                  {producto.notas && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{producto.notas}</p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => updateQty(producto, -1)}
                    disabled={qty === 0 || sinStock}
                    aria-label="Quitar uno"
                    className="w-9 h-9 rounded-full border-2 border-[#1c2b4b] text-[#1c2b4b] text-xl font-bold flex items-center justify-center disabled:opacity-25 active:scale-95 transition-transform"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-bold text-gray-900 text-lg tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => updateQty(producto, 1)}
                    disabled={sinStock}
                    aria-label="Agregar uno"
                    className="w-9 h-9 rounded-full bg-[#1c2b4b] text-white text-xl font-bold flex items-center justify-center active:scale-95 transition-transform disabled:opacity-25"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })
        )}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-2">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => router.push('/pedido')}
              className="w-full bg-[#1c2b4b] text-white rounded-2xl py-4 flex items-center justify-between px-5 shadow-xl active:scale-98 transition-transform"
            >
              <div className="text-left">
                <p className="text-xs text-white/70">
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                </p>
                <p className="font-bold text-xl">
                  ${totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <span className="font-semibold text-base">Ver pedido →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
