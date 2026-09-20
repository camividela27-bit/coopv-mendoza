import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return Response.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const session = await verifyToken(token)
    return Response.json({
      is_admin: session.is_admin,
      is_proveedor: session.is_proveedor ?? false,
    })
  } catch {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }
}
