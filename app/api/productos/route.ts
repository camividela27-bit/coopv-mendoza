import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const soloClub = request.nextUrl.searchParams.get('solo_club') === 'true'

  let query = supabase
    .from('productos')
    .select('id, nombre, precio, productor, notas, stock, detalles, imagen_url, max_por_pedido, categoria, solo_club')
    .eq('disponible', true)
    .order('nombre')

  if (soloClub) {
    query = query.eq('solo_club', true)
  } else {
    query = query.or('solo_club.is.null,solo_club.eq.false')
  }

  const { data, error } = await query

  if (error) { console.error('[productos API]', error); return Response.json({ error: error.message }, { status: 500 }) }
  return Response.json(data ?? [])
}
