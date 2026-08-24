import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 })
  try { await verifyToken(token) } catch { return Response.json({ error: 'No autorizado' }, { status: 401 }) }

  const { data, error } = await supabase
    .from('novedades_club')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}
