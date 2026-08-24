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

export async function POST(request: NextRequest) {
  if (!await requireAdmin()) return Response.json({ error: 'No autorizado' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return Response.json({ error: 'No se recibió archivo' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = await file.arrayBuffer()

  const { error } = await supabase.storage
    .from('club-images')
    .upload(filename, buffer, { contentType: file.type, upsert: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from('club-images').getPublicUrl(filename)
  return Response.json({ url: data.publicUrl })
}
