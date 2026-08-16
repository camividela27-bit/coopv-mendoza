'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/app/components/AppHeader'
import type { CartItem } from '@/lib/types'

const CART_KEY = 'coopv-cart'
const ALIAS = 'coope.mza'
const WA_NUMBER = '5492615869777'

export default function PedidoPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [confirmed, setConfirmed] = useState(false)
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [confirmedItems, setConfirmedItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [nombre, setNombre] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      try {
        setCart(Object.values(JSON.parse(saved) as Record<string, CartItem>))
      } catch { /* ignore */ }
    }
    const raw = document.cookie
      .split('; ')
      .find(r => r.startsWith('nombre='))
      ?.split('=')[1]
    if (raw) setNombre(decodeURIComponent(raw))
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
      setConfirmedTotal(total)
      setConfirmedItems(cart)
      localStorage.removeItem(CART_KEY)
      setConfirmed(true)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function copyAlias() {
    navigator.clipboard.writeText(ALIAS).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function openWhatsApp() {
    const totalStr = `$${confirmedTotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`
    const msg = nombre
      ? `Hola Moni, te mando el comprobante de mi transferencia por ${totalStr}. Soy ${nombre}.`
      : `Hola Moni, te mando el comprobante de mi transferencia por ${totalStr}.`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl">
              ✅
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido confirmado!</h2>
            <p className="text-gray-500 mb-6">Ahora realizá la transferencia para completar tu pedido.</p>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-4">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalle de tu pedido</p>
              </div>
              <div className="divide-y divide-gray-50">
                {confirmedItems.map(item => (
                  <div key={item.producto_id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 leading-snug">{item.nombre}</p>
                      <p className="text-gray-400 text-xs">{item.cantidad} × ${item.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
                    </div>
                    <p className="font-semibold text-gray-700 ml-4 flex-shrink-0">
                      ${(item.precio * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="font-semibold text-gray-700">Total a transferir</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${confirmedTotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">
              <p className="text-sm text-blue-700 font-medium mb-2">Alias de transferencia</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-blue-900 tracking-wide">{ALIAS}</span>
                <button
                  onClick={copyAlias}
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors"
                >
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <button
              onClick={openWhatsApp}
              className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold text-base mb-3 flex items-center justify-center gap-2"
            >
              📲 Enviar comprobante por WhatsApp
            </button>

            <button
              onClick={() => router.push('/inicio')}
              className="text-gray-400 text-sm py-2"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <AppHeader />

      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">
          <p className="text-blue-800 font-semibold text-sm">📍 Retiro en Sede</p>
          <p className="text-blue-700 text-sm mt-0.5">Primer viernes del mes · Pago por transferencia bancaria</p>
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

            <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-between mb-5">
              <span className="text-gray-700 font-semibold">Total a transferir</span>
              <span className="font-bold text-2xl text-gray-900">
                ${total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </span>
            </div>

            <p className="text-xs text-gray-400 text-center mb-5">
              Al confirmar, vas a ver el alias de transferencia y el botón de WhatsApp para enviar el comprobante.
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
