import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminPedidosPage() {
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select(`
      id, estado, confirmed_at,
      socio:socios (nsu, nombre),
      items:pedido_items (
        cantidad, precio_unitario,
        producto:productos (nombre)
      ),
      fecha_entrega:fechas_entrega (fecha, descripcion)
    `)
    .in('estado', ['confirmado', 'entregado'])
    .order('confirmed_at', { ascending: false })

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">Error al cargar pedidos: {error.message}</p>
      </div>
    )
  }

  const typed = (pedidos ?? []) as unknown as PedidoAdmin[]

  const totalGeneral = typed.reduce((sum, p) =>
    sum + p.items.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0), 0
  )

  return (
    <div className="min-h-screen">
      <header className="bg-[#1a2744] text-white shadow-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/admin" className="text-2xl text-white/70 hover:text-white">‹</Link>
          <div>
            <p className="text-xs text-amber-400 font-bold tracking-wider uppercase">Admin</p>
            <h1 className="font-bold text-lg">Pedidos confirmados</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {typed.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-600 font-medium">No hay pedidos confirmados todavía.</p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-amber-800 font-bold text-lg">{typed.length} pedidos</p>
                <p className="text-amber-600 text-sm">en total</p>
              </div>
              <div className="text-right">
                <p className="text-amber-800 font-bold text-lg">
                  ${totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                </p>
                <p className="text-amber-600 text-sm">suma total</p>
              </div>
            </div>

            {/* Orders list */}
            <div className="space-y-3">
              {typed.map(pedido => {
                const total = pedido.items.reduce(
                  (s, i) => s + i.precio_unitario * i.cantidad, 0
                )
                return (
                  <div key={pedido.id} className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-900">
                          {pedido.socio?.nombre ?? '—'}
                        </p>
                        <p className="text-sm text-gray-500">NSU {pedido.socio?.nsu}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-600 text-lg">
                          ${total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          pedido.estado === 'entregado'
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {pedido.estado}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 border-t border-gray-100 pt-3">
                      {pedido.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.cantidad}× {item.producto?.nombre ?? '—'}
                          </span>
                          <span className="text-gray-500">
                            ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                      {formatDate(pedido.confirmed_at)}
                    </p>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
