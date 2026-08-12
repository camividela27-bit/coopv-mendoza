import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('fechas_entrega')
    .select('id, fecha, descripcion, activa')
    .eq('activa', true)
    .order('fecha', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}
