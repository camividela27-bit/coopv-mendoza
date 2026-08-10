import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
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
    .from('fechas_entrega')
    .select('*')
    .order('fecha', { ascending: true })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data ?? [])
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) {
    return Response.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { fecha, descripcion } = await request.json() as { fecha: string; descripcion: string }

  if (!descripcion?.trim()) {
    return Response.json({ error: 'La descripción es requerida' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('fechas_entrega')
    .insert({ fecha: fecha || null, descripcion: descripcion.trim(), activa: true })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
