import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  try {
    const session = await verifyToken(token)
    return session.is_admin ? session : null
  } catch {
    return null
  }
}

export async function GET() {
  if (!await requireAdmin()) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id, estado, confirmed_at,
      socio:socios (nsu, nombre),
      items:pedido_items (
        cantidad, precio_unitario,
        producto:productos (nombre, productor)
      ),
      fecha_entrega:fechas_entrega (fecha, descripcion)
    `)
    .in('estado', ['confirmado', 'entregado'])
    .order('confirmed_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function DELETE() {
  if (!await requireAdmin()) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  // Delete all items first, then all pedidos
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('id')
    .in('estado', ['confirmado', 'entregado'])

  if (!pedidos || pedidos.length === 0) {
    return Response.json({ ok: true, deleted: 0 })
  }

  const ids = pedidos.map(p => p.id)

  const { error: itemsError } = await supabase
    .from('pedido_items')
    .delete()
    .in('pedido_id', ids)

  if (itemsError) return Response.json({ error: itemsError.message }, { status: 500 })

  const { error: pedidosError } = await supabase
    .from('pedidos')
    .delete()
    .in('id', ids)

  if (pedidosError) return Response.json({ error: pedidosError.message }, { status: 500 })

  return Response.json({ ok: true, deleted: ids.length })
}
