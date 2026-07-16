import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('productos')
    .select('id, nombre, precio, productor, disponible, notas')
    .eq('disponible', true)
    .order('nombre')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}
