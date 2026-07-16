'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Producto, CartItem } from '@/lib/types'

const CART_KEY = 'coopv-cart'

export default function CatalogoPage() {
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [loading, setLoading] = useState(true)
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      try { setCart(JSON.parse(saved)) } catch { /* ignore */ }
    }
    const sessionName = document.cookie
      .split('; ')
      .find(r => r.startsWith('nombre='))
      ?.split('=')[1]
    if (sessionName) setNombre(decodeURIComponent(sessionName))

    fetch('/api/productos')
      .then(r => r.json())
      .then((data: Producto[]) => setProductos(data))
      .catch(() => { /* handled by empty state */ })
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

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem(CART_KEY)
    router.push('/login')
  }

  const cartValues = Object.values(cart)
  const totalItems = cartValues.reduce((s, i) => s + i.cantidad, 0)
  const totalPesos = cartValues.reduce((s, i) => s + i.precio * i.cantidad, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header className="bg-blue-900 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-400 font-bold tracking-wider uppercase">COOPV Mendoza</p>
            <h1 className="font-bold text-lg leading-tight">Productos de Amigos</h1>
          </div>
          <button
            onClick={logout}
            className="text-xs text-white/60 hover:text-white transition-colors px-2 py-1"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Products */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-2.5">
        {productos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-gray-600 font-medium">No hay productos disponibles por ahora.</p>
            <p className="text-gray-400 text-sm mt-1">Consultá con la coordinación.</p>
          </div>
        ) : (
          productos.map(producto => {
            const qty = cart[producto.id]?.cantidad ?? 0
            return (
              <div
                key={producto.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 leading-snug">{producto.nombre}</p>
                  {producto.productor && (
                    <p className="text-sm text-gray-500 truncate">{producto.productor}</p>
                  )}
                  <p className="text-blue-900 font-bold mt-1 text-lg">
                    ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </p>
                  {producto.notas && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">{producto.notas}</p>
                  )}
                </div>

                {/* Quantity control */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => updateQty(producto, -1)}
                    disabled={qty === 0}
                    aria-label="Quitar uno"
                    className="w-9 h-9 rounded-full border-2 border-blue-900 text-blue-900 text-xl font-bold flex items-center justify-center disabled:opacity-25 active:scale-95 transition-transform"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-bold text-gray-900 text-lg tabular-nums">
                    {qty}
                  </span>
                  <button
                    onClick={() => updateQty(producto, 1)}
                    aria-label="Agregar uno"
                    className="w-9 h-9 rounded-full bg-blue-900 text-white text-xl font-bold flex items-center justify-center active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-2">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => router.push('/pedido')}
              className="w-full bg-blue-900 text-white rounded-2xl py-4 flex items-center justify-between px-5 shadow-xl active:scale-98 transition-transform"
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
