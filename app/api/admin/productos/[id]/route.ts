import type { NextRequest } from 'next/server'
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
  } catch {
    return null
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requireAdmin()) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json() as Record<string, unknown>

  const updates: Record<string, unknown> = {}
  if ('disponible' in body) updates.disponible = body.disponible
  if ('stock' in body) updates.stock = body.stock
  if ('contribuidor_email' in body) updates.contribuidor_email = body.contribuidor_email || null

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'Sin campos para actualizar' }, { status: 400 })
  }

  const { error } = await supabase
    .from('productos')
    .update(updates)
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
