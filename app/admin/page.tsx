import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) redirect('/login')
  const session = await verifyToken(token)

  async function logout() {
    'use server'
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-green-800 text-white shadow-md">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-green-200">COOPV Mendoza · Administración</p>
            <h1 className="font-bold text-lg">{session.nombre}</h1>
          </div>
          <form action={logout}>
            <button type="submit" className="text-xs text-green-200 hover:text-white px-2 py-1">
              Salir
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-3">
        <Link
          href="/admin/pedidos"
          className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-400 hover:shadow-sm transition-all"
        >
          <p className="font-bold text-gray-900 text-lg">📋 Ver pedidos</p>
          <p className="text-sm text-gray-500 mt-1">Todos los pedidos confirmados por los socios</p>
        </Link>

        <Link
          href="/admin/productos"
          className="block bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-400 hover:shadow-sm transition-all"
        >
          <p className="font-bold text-gray-900 text-lg">🌿 Gestionar productos</p>
          <p className="text-sm text-gray-500 mt-1">Activar o desactivar disponibilidad de productos</p>
        </Link>
      </div>
    </div>
  )
}
