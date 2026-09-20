'use client'

import { useState, useEffect, useCallback } from 'react'

interface Item {
  cantidad: number
  precio_unitario: number
  producto: { nombre: string; productor: string | null } | null
}

interface Pedido {
  id: string
  items: Item[]
}

interface LineaProductor {
  producto: string
  cantidad: number
  subtotal: number
}

interface GrupoProductor {
  productor: string
  lineas: LineaProductor[]
  total: number
}

function agruparPorProductor(pedidos: Pedido[]): GrupoProductor[] {
  const map = new Map<string, Map<string, LineaProductor>>()

  for (const pedido of pedidos) {
    for (const item of pedido.items) {
      const productor = item.producto?.productor ?? 'Sin productor'
      const nombreProducto = item.producto?.nombre ?? '—'

      if (!map.has(productor)) map.set(productor, new Map())
      const productoMap = map.get(productor)!

      if (!productoMap.has(nombreProducto)) {
        productoMap.set(nombreProducto, { producto: nombreProducto, cantidad: 0, subtotal: 0 })
      }

      const linea = productoMap.get(nombreProducto)!
      linea.cantidad += item.cantidad
      linea.subtotal += item.precio_unitario * item.cantidad
    }
  }

  return Array.from(map.entries())
    .map(([productor, productoMap]) => {
      const lineas = Array.from(productoMap.values())
      const total = lineas.reduce((s, l) => s + l.subtotal, 0)
      return { productor, lineas, total }
    })
    .sort((a, b) => a.productor.localeCompare(b.productor))
}

export default function ProveedorReportePage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
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

  const grupos = agruparPorProductor(pedidos).filter(g =>
    !busqueda.trim() || g.productor.toLowerCase().includes(busqueda.toLowerCase())
  )
  const totalGeneral = grupos.reduce((s, g) => s + g.total, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando reporte...</p>
      </div>
    )
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-gray-900 text-lg">Reporte por productor</h1>
      </div>

      <input
        type="text"
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por productor..."
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b] mb-4"
      />

      {grupos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500 font-medium">{busqueda ? 'Sin resultados.' : 'No hay pedidos para reportar.'}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {grupos.map(grupo => (
              <div key={grupo.productor} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <p className="font-bold text-gray-900 text-sm">{grupo.productor}</p>
                  <p className="font-semibold text-[#1c2b4b] text-sm">
                    ${grupo.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {grupo.lineas.map((linea, idx) => (
                    <div key={idx} className="px-4 py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{linea.producto}</p>
                        <p className="text-xs text-gray-400">{linea.cantidad} unidades</p>
                      </div>
                      <p className="font-semibold text-gray-700 tabular-nums">
                        ${linea.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  ))}
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
              <p className="text-white/60 text-xs">{grupos.length} productores</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
