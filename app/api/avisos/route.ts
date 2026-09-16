import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 })

  try {
    await verifyToken(token)
  } catch {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('novedades')
    .select('id, titulo, descripcion, etiqueta, imagen_url, link_url, orden')
    .eq('activa', true)
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) return Response.json([], { status: 200 })

  const avisos = (data ?? []).map(n => ({
    id: n.id,
    emoji: n.etiqueta ?? '📌',
    asunto: n.titulo,
    mensaje: n.descripcion ?? '',
    imagen_url: n.imagen_url ?? null,
    link_url: n.link_url ?? null,
  }))

  return Response.json(avisos)
}
