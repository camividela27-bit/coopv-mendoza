import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return Response.json({ habilitado: false, descripcion: null }, { status: 401 })
  try {
    await verifyToken(token)
  } catch {
    return Response.json({ habilitado: false, descripcion: null }, { status: 401 })
  }

  const { data } = await supabase
    .from('fechas_entrega')
    .select('habilitado, descripcion')
    .eq('activa', true)
    .order('fecha', { ascending: true })
    .limit(1)
    .maybeSingle()

  return Response.json({
    habilitado: data?.habilitado ?? true,
    descripcion: data?.descripcion ?? null,
  })
}
