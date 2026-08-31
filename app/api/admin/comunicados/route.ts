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

export async function GET() {
  if (!await requireAdmin()) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('comunicados')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { asunto, mensaje, emoji, imagen_url } = await request.json() as {
    asunto: string
    mensaje: string
    emoji?: string
    imagen_url?: string | null
  }

  if (!asunto?.trim() || !mensaje?.trim()) {
    return Response.json({ error: 'Asunto y mensaje requeridos' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comunicados')
    .insert({ asunto: asunto.trim(), mensaje: mensaje.trim(), emoji: emoji ?? '📢', imagen_url: imagen_url ?? null })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
