import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { CartItem } from '@/lib/types'

async function getSession(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id, estado, confirmed_at, created_at,
      items:pedido_items (
        id, cantidad, precio_unitario,
        producto:productos (nombre)
      ),
      fecha_entrega:fechas_entrega (fecha, descripcion)
    `)
    .eq('socio_id', session.socio_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  const session = await getSession(request)
  if (!session) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const body = await request.json()
  const { items, fecha_entrega_id } = body as { items: CartItem[]; fecha_entrega_id?: string }

  if (!items || items.length === 0) {
    return Response.json({ error: 'El pedido no tiene productos' }, { status: 400 })
  }

  const { data: pedido, error: pedidoError } = await supabase
    .from('pedidos')
    .insert({
      socio_id: session.socio_id,
      fecha_entrega_id: fecha_entrega_id ?? null,
      estado: 'confirmado',
      confirmed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (pedidoError) return Response.json({ error: pedidoError.message }, { status: 500 })

  const itemsToInsert = items.map(item => ({
    pedido_id: pedido.id,
    producto_id: item.producto_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio,
  }))

  const { error: itemsError } = await supabase.from('pedido_items').insert(itemsToInsert)

  if (itemsError) {
    await supabase.from('pedidos').delete().eq('id', pedido.id)
    return Response.json({ error: itemsError.message }, { status: 500 })
  }

  return Response.json({ pedido_id: pedido.id }, { status: 201 })
}
