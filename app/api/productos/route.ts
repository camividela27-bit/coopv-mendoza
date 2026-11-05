import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const tipo = request.nextUrl.searchParams.get('tipo')

  let query = supabase
    .from('productos')
    .select('id, nombre, precio, productor, notas, stock, detalles, imagen_url, max_por_pedido, categoria, solo_club, tipo_catalogo')
    .eq('disponible', true)
    .order('nombre')

  if (tipo) {
    query = query.eq('tipo_catalogo', tipo)
  }

  const { data, error } = await query

  if (error) { console.error('[productos API]', error); return Response.json({ error: error.message }, { status: 500 }) }
  return Response.json(data ?? [])
}
