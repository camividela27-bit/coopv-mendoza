import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nsu } = body as { nsu: number }

  if (!nsu || isNaN(nsu)) {
    return Response.json({ error: 'NSU inválido' }, { status: 400 })
  }

  const { data: socio, error } = await supabase
    .from('socios')
    .select('id, nsu, nombre, is_admin, activo')
    .eq('nsu', nsu)
    .single()

  if (error || !socio) {
    return Response.json({ error: 'NSU no encontrado' }, { status: 401 })
  }

  if (!socio.activo) {
    return Response.json({ error: 'Cuenta inactiva. Contactá a la coordinación.' }, { status: 401 })
  }

  const token = await signToken({
    socio_id: socio.id,
    nsu: socio.nsu,
    nombre: socio.nombre,
    is_admin: socio.is_admin,
  })

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  cookieStore.set('nombre', encodeURIComponent(socio.nombre), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return Response.json({ ok: true, is_admin: socio.is_admin })
}
