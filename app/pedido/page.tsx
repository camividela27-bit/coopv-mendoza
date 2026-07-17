'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/lib/types'

const CART_KEY = 'coopv-cart'

export default function PedidoPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      try {
        setCart(Object.values(JSON.parse(saved) as Record<string, CartItem>))
      } catch { /* ignore */ }
    }
  }, [])

  const total = cart.reduce((s, i) => s + i.precio * i.cantidad, 0)

  async function confirmar() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No se pudo confirmar el pedido')
        return
      }
      localStorage.removeItem(CART_KEY)
      setConfirmed(true)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido confirmado!</h2>
          <p className="text-gray-600 mb-1">Tu pedido fue registrado correctamente.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-5 text-sm text-blue-800">
            <p className="font-semibold">📍 Retiro en Sede</p>
            <p className="mt-0.5">Primer viernes del mes</p>
            <p className="mt-0.5 text-blue-700">Pago en efectivo al retirar</p>
          </div>
          <button
            onClick={() => router.push('/catalogo')}
            className="bg-[#1c2b4b] text-white px-8 py-3 rounded-xl font-semibold w-full"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="bg-[#1c2b4b] text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-2xl text-white/70 hover:text-white"
            aria-label="Volver"
          >
            ‹
          </button>
          <div>
            <p className="text-xs text-amber-400 font-bold tracking-wider uppercase">COOPV Mendoza</p>
            <h1 className="font-bold text-lg">Mi Pedido</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Pickup info */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">
          <p className="text-blue-800 font-semibold text-sm">📍 Retiro en Sede</p>
          <p className="text-blue-700 text-sm mt-0.5">Primer viernes del mes · Pago en efectivo</p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🛒</p>
            <p className="text-gray-600 font-medium">Tu pedido está vacío</p>
            <button
              onClick={() => router.push('/catalogo')}
              className="mt-4 text-[#1c2b4b] font-semibold underline"
            >
              Ver catálogo
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="space-y-2.5 mb-5">
              {cart.map(item => (
                <div
                  key={item.producto_id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 leading-snug">{item.nombre}</p>
                    {item.productor && (
                      <p className="text-sm text-gray-400">{item.productor}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-sm text-gray-500">× {item.cantidad}</p>
                    <p className="font-bold text-gray-900">
                      ${(item.precio * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-between mb-5">
              <span className="text-gray-700 font-semibold">Total a pagar</span>
              <span className="font-bold text-2xl text-gray-900">
                ${total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </span>
            </div>

            <p className="text-xs text-gray-400 text-center mb-5">
              Precio en efectivo al momento del retiro en Sede.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              onClick={confirmar}
              disabled={loading}
              className="w-full bg-[#1c2b4b] text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-transform"
            >
              {loading ? 'Confirmando...' : 'Confirmar pedido'}
            </button>

            <button
              onClick={() => router.push('/catalogo')}
              className="w-full text-gray-500 py-3 mt-2 text-sm"
            >
              ← Seguir agregando productos
            </button>
          </>
        )}
      </div>
    </div>
  )
}
