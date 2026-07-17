'use client'

import { useState, useEffect, useCallback } from 'react'

interface PedidoAdmin {
  id: string
  confirmed_at: string
  estado: string
  socio: { nsu: number; nombre: string } | null
  items: Array<{
    cantidad: number
    precio_unitario: number
    producto: { nombre: string } | null
  }>
  fecha_entrega: { fecha: string; descripcion: string | null } | null
}

function groupByFecha(pedidos: PedidoAdmin[]) {
  const map = new Map<string, { label: string; pedidos: PedidoAdmin[] }>()
  for (const p of pedidos) {
    const key = p.fecha_entrega?.descripcion ?? p.fecha_entrega?.fecha ?? 'Sin fecha asignada'
    if (!map.has(key)) map.set(key, { label: key, pedidos: [] })
    map.get(key)!.pedidos.push(p)
  }
  return Array.from(map.values())
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [clearingAll, setClearingAll] = useState(false)

  const loadPedidos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pedidos')
      const data = await res.json()
      setPedidos(Array.isArray(data) ? data : [])
    } catch {
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPedidos() }, [loadPedidos])

  async function marcarEntregado(id: string) {
    setActing(id)
    try {
      const res = await fetch(`/api/admin/pedidos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'entregado' }),
      })
      if (res.ok) {
        setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado: 'entregado' } : p))
      }
    } finally {
      setActing(null)
    }
  }

  async function eliminarPedido(id: string, nombre: string) {
    if (!window.confirm(`¿Eliminar el pedido de ${nombre}? Esta acción no se puede deshacer.`)) return
    setActing(id)
    try {
      const res = await fetch(`/api/admin/pedidos/${id}`, { method: 'DELETE' })
      if (res.ok) setPedidos(prev => prev.filter(p => p.id !== id))
    } finally {
      setActing(null)
    }
  }

  async function limpiarTodos() {
    if (!window.confirm(`¿Eliminar los ${pedidos.length} pedidos? Esto borra todos los pedidos confirmados y entregados. No se puede deshacer.`)) return
    setClearingAll(true)
    try {
      const res = await fetch('/api/admin/pedidos', { method: 'DELETE' })
      if (res.ok) setPedidos([])
    } finally {
      setClearingAll(false)
    }
  }

  const groups = groupByFecha(pedidos)
  const totalGeneral = pedidos.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0), 0
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando pedidos...</p>
      </div>
    )
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-gray-900 text-lg">Pedidos confirmados</h1>
        <div className="flex items-center gap-2">
          {pedidos.length > 0 && (
            <button
              onClick={limpiarTodos}
              disabled={clearingAll}
              className="text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {clearingAll ? 'Limpiando...' : 'Limpiar todos'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="text-xs text-[#1c2b4b] border border-[#1c2b4b] px-3 py-1.5 rounded-lg font-medium hover:bg-[#1c2b4b] hover:text-white transition-colors"
          >
            Imprimir
          </button>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">No hay pedidos confirmados.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {groups.map(group => {
              const groupTotal = group.pedidos.reduce(
                (sum, p) => sum + p.items.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0), 0
              )
              return (
                <div key={group.label}>
                  <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">
                    {group.label.toUpperCase()} ({group.pedidos.length})
                  </p>
                  <div className="space-y-2">
                    {group.pedidos.map(pedido => {
                      const total = pedido.items.reduce(
                        (s, i) => s + i.precio_unitario * i.cantidad, 0
                      )
                      const itemCount = pedido.items.reduce((s, i) => s + i.cantidad, 0)
                      const nombreSocio = pedido.socio?.nombre ?? '—'
                      return (
                        <div key={pedido.id} className="bg-white border border-gray-200 rounded-2xl">
                          <div className="p-4 flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 leading-snug">{nombreSocio}</p>
                              <p className="text-sm text-gray-400">
                                NSU {pedido.socio?.nsu} · {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {pedido.items.map((item, idx) => (
                                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                    {item.cantidad}× {item.producto?.nombre ?? '—'}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-[#1c2b4b] text-base">
                                ${total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                pedido.estado === 'entregado'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {pedido.estado === 'entregado' ? '✓ entregado' : 'confirmado'}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-2">
                            {pedido.estado === 'confirmado' && (
                              <button
                                onClick={() => marcarEntregado(pedido.id)}
                                disabled={acting === pedido.id}
                                className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                              >
                                {acting === pedido.id ? '...' : '✓ Marcar entregado'}
                              </button>
                            )}
                            <button
                              onClick={() => eliminarPedido(pedido.id, nombreSocio)}
                              disabled={acting === pedido.id}
                              className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {acting === pedido.id ? '...' : 'Eliminar'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-2 px-4 py-2 bg-gray-50 rounded-xl flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal {group.label}</span>
                    <span className="font-semibold text-gray-700">
                      ${groupTotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 bg-[#1c2b4b] text-white rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs">Total general</p>
              <p className="font-bold text-xl">
                ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">{pedidos.length} pedidos</p>
              <p className="text-amber-400 font-semibold text-sm">
                {pedidos.reduce((s, p) => s + p.items.reduce((ss, i) => ss + i.cantidad, 0), 0)} productos
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
