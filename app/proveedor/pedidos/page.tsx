'use client'

import { useState, useEffect, useCallback } from 'react'

interface PedidoProveedor {
  id: string
  confirmed_at: string
  estado: string
  socio: { nsu: number; nombre: string } | null
  items: Array<{
    id: string
    cantidad: number
    precio_unitario: number
    producto: { nombre: string; productor: string | null } | null
  }>
  fecha_entrega: { fecha: string; descripcion: string | null } | null
}

function groupByFecha(pedidos: PedidoProveedor[]) {
  const map = new Map<string, { label: string; pedidos: PedidoProveedor[] }>()
  for (const p of pedidos) {
    const key = p.fecha_entrega?.descripcion ?? p.fecha_entrega?.fecha ?? 'Sin fecha asignada'
    if (!map.has(key)) map.set(key, { label: key, pedidos: [] })
    map.get(key)!.pedidos.push(p)
  }
  return Array.from(map.values())
}

export default function ProveedorPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoProveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const loadPedidos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/proveedor/pedidos')
      const data = await res.json()
      setPedidos(Array.isArray(data) ? data : [])
    } catch {
      setPedidos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPedidos() }, [loadPedidos])

  const pedidosFiltrados = busqueda.trim()
    ? pedidos.filter(p =>
        p.socio?.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        String(p.socio?.nsu ?? '').includes(busqueda) ||
        p.items.some(i => i.producto?.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      )
    : pedidos

  const groups = groupByFecha(pedidosFiltrados)
  const totalGeneral = pedidosFiltrados.reduce(
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
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-gray-900 text-lg">Pedidos confirmados</h1>
        <span className="text-xs text-gray-400">{pedidos.length} pedidos</span>
      </div>

      <input
        type="text"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre, NSU o producto..."
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b] mb-4"
      />

      {pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">{busqueda ? 'Sin resultados.' : 'No hay pedidos aún.'}</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {groups.map(group => (
              <div key={group.label}>
                <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">
                  {group.label.toUpperCase()} ({group.pedidos.length})
                </p>
                <div className="space-y-2">
                  {group.pedidos.map(pedido => {
                    const total = pedido.items.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0)
                    const itemCount = pedido.items.reduce((s, i) => s + i.cantidad, 0)
                    return (
                      <div key={pedido.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 leading-snug">{pedido.socio?.nombre ?? '—'}</p>
                            <p className="text-sm text-gray-400 mb-2">
                              NSU {pedido.socio?.nsu} · {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                            </p>
                            <div className="flex flex-wrap gap-1">
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
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-[#1c2b4b] text-white rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs">Total general</p>
              <p className="font-bold text-xl">
                ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">{pedidosFiltrados.length} pedidos</p>
              <p className="text-amber-400 font-semibold text-sm">
                {pedidosFiltrados.reduce((s, p) => s + p.items.reduce((ss, i) => ss + i.cantidad, 0), 0)} productos
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
