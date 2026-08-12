import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nsu, password } = body as { nsu: number; password: string }

  if (!nsu || isNaN(nsu)) {
    return Response.json({ error: 'NSU inválido' }, { status: 400 })
  }

  if (!password) {
    return Response.json({ error: 'Ingresá tu contraseña' }, { status: 400 })
  }

  const { data: socio, error } = await supabase
    .from('socios')
    .select('id, nsu, nombre, is_admin, activo, password_hash, must_change_password')
    .eq('nsu', nsu)
    .single()

  if (error || !socio) {
    return Response.json({ error: 'NSU no encontrado' }, { status: 401 })
  }

  if (!socio.activo) {
    return Response.json({ error: 'Cuenta inactiva. Contactá a la coordinación.' }, { status: 401 })
  }

  // Si no tiene hash, la contraseña inicial es el NSU como string
  const valid = socio.password_hash
    ? await bcrypt.compare(password, socio.password_hash)
    : password === socio.nsu.toString()

  if (!valid) {
    return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 })
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

  const rawName = socio.nombre.includes(',')
    ? (socio.nombre.split(',')[1]?.trim() ?? socio.nombre)
    : socio.nombre
  const firstName = rawName.split(/\s+/)[0] ?? rawName
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()

  cookieStore.set('nombre', displayName, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return Response.json({
    ok: true,
    is_admin: socio.is_admin,
    must_change_password: socio.must_change_password ?? true,
  })
}
