import { supabase } from '@/lib/supabase'
import PrintButton from './PrintButton'

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

function groupByFecha(pedidos: PedidoAdmin[]) {
  const map = new Map<string, { label: string; pedidos: PedidoAdmin[] }>()
  for (const p of pedidos) {
    const key = p.fecha_entrega?.descripcion ?? p.fecha_entrega?.fecha ?? 'Sin fecha asignada'
    if (!map.has(key)) map.set(key, { label: key, pedidos: [] })
    map.get(key)!.pedidos.push(p)
  }
  return Array.from(map.values())
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
      <div className="p-6">
        <p className="text-red-600 text-sm">Error al cargar pedidos: {error.message}</p>
      </div>
    )
  }

  const typed = (pedidos ?? []) as unknown as PedidoAdmin[]
  const groups = groupByFecha(typed)
  const totalGeneral = typed.reduce(
    (sum, p) => sum + p.items.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0), 0
  )

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-bold text-gray-900 text-lg">Pedidos confirmados</h1>
        <PrintButton />
      </div>

      {typed.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">No hay pedidos confirmados todavía.</p>
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
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">
                      {group.label.toUpperCase()} ({group.pedidos.length})
                    </p>
                  </div>
                  <div className="space-y-2">
                    {group.pedidos.map(pedido => {
                      const total = pedido.items.reduce(
                        (s, i) => s + i.precio_unitario * i.cantidad, 0
                      )
                      const itemCount = pedido.items.reduce((s, i) => s + i.cantidad, 0)
                      return (
                        <div key={pedido.id} className="bg-white border border-gray-200 rounded-2xl">
                          <div className="p-4 flex items-center justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-900 leading-snug">
                                {pedido.socio?.nombre ?? '—'}
                              </p>
                              <p className="text-sm text-gray-400">
                                NSU {pedido.socio?.nsu} · {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-[#1c2b4b] text-base">
                                ${total.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                pedido.estado === 'entregado'
                                  ? 'bg-gray-100 text-gray-500'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {pedido.estado}
                              </span>
                            </div>
                          </div>
                          <div className="border-t border-gray-100 px-4 pb-3 pt-2 space-y-1">
                            {pedido.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {item.cantidad}× {item.producto?.nombre ?? '—'}
                                </span>
                                <span className="text-gray-400">
                                  ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                                </span>
                              </div>
                            ))}
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
              <p className="text-white/60 text-xs">{typed.length} pedidos</p>
              <p className="text-amber-400 font-semibold text-sm">
                {typed.reduce((s, p) => s + p.items.reduce((ss, i) => ss + i.cantidad, 0), 0)} productos
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
