import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) redirect('/login')

  try {
    const session = await verifyToken(token)
    if (!session.is_admin) redirect('/inicio')
  } catch {
    redirect('/login')
  }

  return (
    <div className="h-screen flex flex-col bg-[#1c2b4b] overflow-hidden">
      <header className="flex-shrink-0 px-4 py-3 flex items-center justify-between border-b border-white/10">
        <span className="text-amber-400 font-bold text-base tracking-wide">COOPV Admin</span>
        <span className="text-white/50 text-sm">Administrador</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-40 flex-shrink-0 px-3 py-4 flex flex-col">
          <p className="text-amber-400 font-bold text-base mb-5 px-2">COOPV</p>
          <AdminSidebar />
        </aside>

        <main className="flex-1 bg-white rounded-tl-2xl overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
