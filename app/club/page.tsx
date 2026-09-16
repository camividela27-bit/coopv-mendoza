'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/app/components/AppHeader'
import PedidosBanner from '@/app/components/PedidosBanner'
import type { Producto, CartItem } from '@/lib/types'

const CART_KEY = 'coopv-cart'

interface Novedad {
  id: string
  titulo: string
  descripcion: string | null
  imagen_url: string | null
  etiqueta: string | null
  link_url: string | null
}

const ORDEN_CATEGORIAS = ['Alimentos', 'Condimentos', 'Limpieza', 'Higiene Personal', 'Armonizadores', 'Pastas Secas', 'Vinos']

export default function ClubPage() {
  const router = useRouter()
  const [novedades, setNovedades] = useState<Novedad[]>([])
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
      fetch('/api/novedades').then(r => r.json()).catch(() => []),
      fetch('/api/productos?solo_club=true').then(r => r.json()).catch(() => []),
      fetch('/api/estado').then(r => r.json()).catch(() => null),
    ]).then(([nov, prod, est]) => {
      if (Array.isArray(nov)) setNovedades(nov as Novedad[])
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

  const categorias = ORDEN_CATEGORIAS.filter(cat => productos.some(p => p.categoria === cat))
  const sinCategoria = productos.filter(p => !p.categoria || !ORDEN_CATEGORIAS.includes(p.categoria))

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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Catálogo Productos Club</h1>
          <p className="text-sm text-gray-500 mt-0.5">Productos disponibles en la sede</p>
        </div>

        {estado && <PedidosBanner habilitado={estado.habilitado} descripcion={estado.descripcion} />}

        {novedades.length > 0 && (
          <div className="space-y-4 mb-8">
            {novedades.map(n => (
              <div key={n.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {n.imagen_url && (
                  <img src={n.imagen_url} alt={n.titulo} className="w-full object-cover" style={{ maxHeight: '260px' }} />
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
                  {n.link_url && (
                    <a
                      href={n.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 bg-[#1c2b4b] text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      Inscribirse →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {productos.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base font-bold text-gray-900">Productos disponibles</span>
              <span className="text-xs bg-[#1c2b4b] text-white px-2.5 py-1 rounded-full font-semibold">Solo presencial</span>
            </div>

            <div className="space-y-6">
              {categorias.map(cat => (
                <div key={cat}>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{cat}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {productos.filter(p => p.categoria === cat).map(p => (
                      <ProductCard
                        key={p.id}
                        producto={p}
                        cantidad={cart[p.id]?.cantidad ?? 0}
                        habilitado={estado?.habilitado ?? false}
                        onUpdate={(delta) => updateQty(p, delta)}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {sinCategoria.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {sinCategoria.map(p => (
                    <ProductCard
                      key={p.id}
                      producto={p}
                      cantidad={cart[p.id]?.cantidad ?? 0}
                      habilitado={estado?.habilitado ?? false}
                      onUpdate={(delta) => updateQty(p, delta)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {novedades.length === 0 && productos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏡</p>
            <p className="text-gray-500 font-medium">Pronto habrá novedades del club.</p>
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
  const agotado = sinStock

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden flex flex-col ${agotado ? 'opacity-50 border-gray-100' : 'border-gray-200'}`}>
      {producto.imagen_url ? (
        <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
          <img src={producto.imagen_url} alt={producto.nombre} className="w-full h-full object-cover" />
          {agotado && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-xs font-bold text-red-500 bg-white px-2 py-1 rounded-full border border-red-200">Sin stock</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full bg-gray-100 flex items-center justify-center text-3xl" style={{ aspectRatio: '1 / 1' }}>
          🛍️
        </div>
      )}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="font-semibold text-gray-900 leading-snug text-xs">{producto.nombre}</p>
        {producto.notas && (
          <p className="text-[10px] text-gray-400 leading-tight">{producto.notas}</p>
        )}
        {producto.stock !== null && producto.stock > 0 && (
          <p className="text-[10px] text-amber-600 font-medium">{producto.stock} disponibles</p>
        )}
        <div className="mt-auto pt-2 flex items-center justify-between gap-1">
          <p className="font-bold text-[#1c2b4b] text-base leading-none">
            ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </p>
          {habilitado && !agotado && (
            cantidad === 0 ? (
              <button
                onClick={() => onUpdate(1)}
                className="bg-[#1c2b4b] text-white text-xs font-bold px-2.5 py-1.5 rounded-xl"
              >
                + Agregar
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdate(-1)}
                  className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold text-sm flex items-center justify-center"
                >−</button>
                <span className="text-sm font-bold text-[#1c2b4b] w-4 text-center">{cantidad}</span>
                <button
                  onClick={() => onUpdate(1)}
                  disabled={producto.max_por_pedido !== null && cantidad >= producto.max_por_pedido}
                  className="w-6 h-6 rounded-full bg-[#1c2b4b] text-white font-bold text-sm flex items-center justify-center disabled:opacity-40"
                >+</button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
