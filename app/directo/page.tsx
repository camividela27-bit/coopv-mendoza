'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/app/components/AppHeader'
import PedidosBanner from '@/app/components/PedidosBanner'
import type { Producto, CartItem } from '@/lib/types'

const CART_KEY = 'coopv-cart'

export default function DirectoPage() {
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState<{ habilitado: boolean; descripcion: string | null } | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY)
    if (saved) {
      try { setCart(JSON.parse(saved)) } catch { /* ignore */ }
    }

    Promise.all([
      fetch('/api/productos?tipo=directo').then(r => r.json()).catch(() => []),
      fetch('/api/estado').then(r => r.json()).catch(() => null),
    ]).then(([prod, est]) => {
      if (Array.isArray(prod)) setProductos(prod as Producto[])
      if (est) setEstado(est as { habilitado: boolean; descripcion: string | null })
    }).finally(() => setLoading(false))
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
      const max = producto.max_por_pedido ?? Infinity
      saveCart({
        ...cart,
        [producto.id]: {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          productor: producto.productor,
          cantidad: Math.min(next, max),
        },
      })
    }
  }

  const cartValues = Object.values(cart)
  const totalItems = cartValues.reduce((s, i) => s + i.cantidad, 0)
  const totalPesos = cartValues.reduce((s, i) => s + i.precio * i.cantidad, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <AppHeader />
      <div className="max-w-lg mx-auto px-4 py-6">
        <button
          onClick={() => router.push('/elegir-catalogo')}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          ← Catálogo
        </button>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Directo de Proveedor</h1>
          <p className="text-sm text-gray-500 mt-0.5">Productos directos desde el proveedor</p>
        </div>

        {estado && <PedidosBanner habilitado={estado.habilitado} descripcion={estado.descripcion} />}

        {productos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {productos.map(p => (
              <ProductCard
                key={p.id}
                producto={p}
                cantidad={cart[p.id]?.cantidad ?? 0}
                habilitado={estado?.habilitado ?? false}
                onUpdate={(delta) => updateQty(p, delta)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-gray-500 font-medium">Pronto habrá productos disponibles.</p>
          </div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-white border-t border-gray-100 shadow-lg">
          <button
            onClick={() => router.push('/pedido')}
            className="w-full bg-[#1c2b4b] text-white rounded-2xl py-4 flex items-center justify-between px-5"
          >
            <span className="bg-white text-[#1c2b4b] text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center">
              {totalItems}
            </span>
            <span className="font-bold text-base">Ver pedido</span>
            <span className="font-semibold text-sm opacity-90">
              ${totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

function ProductCard({
  producto, cantidad, habilitado, onUpdate,
}: {
  producto: Producto
  cantidad: number
  habilitado: boolean
  onUpdate: (delta: number) => void
}) {
  const sinStock = producto.stock === 0
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden flex flex-col ${sinStock ? 'opacity-50 border-gray-100' : 'border-gray-200'}`}>
      <div className="w-full bg-gray-100 flex items-center justify-center text-3xl" style={{ aspectRatio: '1 / 1' }}>
        {producto.imagen_url
          ? <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
          : '🛍️'}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-semibold text-gray-900 leading-snug text-xs">{producto.nombre}</p>
        {producto.productor && <p className="text-[10px] text-gray-400">{producto.productor}</p>}
        {producto.notas && <p className="text-[10px] text-gray-400 leading-tight">{producto.notas}</p>}
        <div className="mt-auto pt-2 flex items-center justify-between gap-1">
          <p className="font-bold text-[#1c2b4b] text-base leading-none">
            ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </p>
          {habilitado && !sinStock && (
            cantidad === 0 ? (
              <button onClick={() => onUpdate(1)} className="bg-[#1c2b4b] text-white text-xs font-bold px-2.5 py-1.5 rounded-xl">
                + Agregar
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button onClick={() => onUpdate(-1)} className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center">−</button>
                <span className="text-sm font-bold text-[#1c2b4b] w-4 text-center">{cantidad}</span>
                <button onClick={() => onUpdate(1)} disabled={producto.max_por_pedido !== null && cantidad >= producto.max_por_pedido} className="w-6 h-6 rounded-full bg-[#1c2b4b] text-white font-bold text-sm flex items-center justify-center disabled:opacity-40">+</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
