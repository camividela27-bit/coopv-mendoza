import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('vino_progreso')
    .select('cajas_vendidas, objetivo')
    .eq('id', 1)
    .single()

  if (error || !data) {
    return Response.json({ cajas: 0, objetivo: 500 })
  }

  return Response.json(
    { cajas: data.cajas_vendidas, objetivo: data.objetivo },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
  )
}
