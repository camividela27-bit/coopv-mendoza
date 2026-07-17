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
    .from('comunicados')
    .select('id, asunto, mensaje, emoji, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) return Response.json([], { status: 200 })
  return Response.json(data ?? [])
}
