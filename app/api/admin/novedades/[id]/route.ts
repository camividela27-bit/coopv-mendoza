import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null
  try {
    const session = await verifyToken(token)
    return session.is_admin ? session : null
  } catch { return null }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return Response.json({ error: 'No autorizado' }, { status: 403 })
  const { id } = await params
  const body = await request.json() as Record<string, unknown>
  const { error } = await supabase.from('novedades_club').update(body).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) return Response.json({ error: 'No autorizado' }, { status: 403 })
  const { id } = await params
  const { error } = await supabase.from('novedades_club').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
