'use client'

import { useState, useEffect, useCallback } from 'react'

interface Item {
  cantidad: number
  precio_unitario: number
  producto: { nombre: string; productor: string | null } | null
}

interface Pedido {
  id: string
  estado: string
  socio: { nsu: number; nombre: string } | null
  items: Item[]
  fecha_entrega: { fecha: string; descripcion: string | null } | null
}

interface LineaProductor {
  producto: string
  cantidad: number
  precio_unitario: number
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
        productoMap.set(nombreProducto, {
          producto: nombreProducto,
          cantidad: 0,
          precio_unitario: item.precio_unitario,
          subtotal: 0,
        })
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

function descargarCSV(grupos: GrupoProductor[]) {
  const rows: string[] = [
    'Productor,Producto,Cantidad,Precio Unitario,Subtotal',
  ]

  for (const grupo of grupos) {
    for (const linea of grupo.lineas) {
      rows.push(
        [
          `"${grupo.productor}"`,
          `"${linea.producto}"`,
          linea.cantidad,
          linea.precio_unitario,
          linea.subtotal,
        ].join(',')
      )
    }
    rows.push(`"TOTAL ${grupo.productor}","","","",${grupo.total}`)
    rows.push('')
  }

  const totalGeneral = grupos.reduce((s, g) => s + g.total, 0)
  rows.push(`"TOTAL GENERAL","","","",${totalGeneral}`)

  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte-proveedores-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportePage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

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

  const grupos = agruparPorProductor(pedidos)
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
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-gray-900 text-lg">Reporte de proveedores</h1>
        {grupos.length > 0 && (
          <button
            onClick={() => descargarCSV(grupos)}
            className="text-xs bg-[#1c2b4b] text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            ↓ Descargar CSV
          </button>
        )}
      </div>

      {grupos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500 font-medium">No hay pedidos para reportar.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {grupos.map(grupo => (
              <div key={grupo.productor} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <p className="font-semibold text-gray-900 text-sm">{grupo.productor}</p>
                  <p className="font-bold text-[#1c2b4b]">
                    ${grupo.total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="divide-y divide-gray-50">
                  {grupo.lineas.map(linea => (
                    <div key={linea.producto} className="px-4 py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-800 font-medium leading-snug">{linea.producto}</p>
                        <p className="text-gray-400 text-xs">
                          {linea.cantidad} {linea.cantidad === 1 ? 'unidad' : 'unidades'} ×{' '}
                          ${linea.precio_unitario.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-700">
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
              <p className="text-white/60 text-xs">Total a rendir</p>
              <p className="font-bold text-xl">
                ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs">{grupos.length} proveedores</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
