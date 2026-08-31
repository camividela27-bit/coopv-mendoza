import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, precio, productor, notas, stock, detalles, imagen_url, max_por_pedido')
    .eq('disponible', true)
    .order('nombre')

  if (error) { console.error('[productos API]', error); return Response.json({ error: error.message }, { status: 500 }) }
  return Response.json(data ?? [])
}
