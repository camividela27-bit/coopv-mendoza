import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) redirect('/login')

  try {
    const session = await verifyToken(token)
    if (!session.is_admin) redirect('/catalogo')
  } catch {
    redirect('/login')
  }

  return <>{children}</>
}
