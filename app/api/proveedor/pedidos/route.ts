import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

async function requireProveedorOrAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  try {
    const session = await verifyToken(token)
    return (session.is_proveedor || session.is_admin) ? session : null
  } catch {
    return null
  }
}

export async function GET() {
  if (!await requireProveedorOrAdmin()) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id, estado, confirmed_at, created_at,
      socio:socios (nsu, nombre),
      items:pedido_items (
        id, cantidad, precio_unitario,
        producto:productos (nombre, productor)
      ),
      fecha_entrega:fechas_entrega (fecha, descripcion)
    `)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}
