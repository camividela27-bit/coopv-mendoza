import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 })

  let session
  try {
    session = await verifyToken(token)
  } catch {
    return Response.json({ error: 'Sesión inválida' }, { status: 401 })
  }

  const { password, confirm } = await request.json() as { password: string; confirm: string }

  if (!password || password.length < 4) {
    return Response.json({ error: 'La contraseña debe tener al menos 4 caracteres' }, { status: 400 })
  }

  if (password !== confirm) {
    return Response.json({ error: 'Las contraseñas no coinciden' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 10)

  const { error } = await supabase
    .from('socios')
    .update({ password_hash: hash, must_change_password: false })
    .eq('id', session.socio_id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, is_admin: session.is_admin })
}
