import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  cookieStore.delete('nombre')
  return Response.json({ ok: true })
}
