'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [nsu, setNsu] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nsu: parseInt(nsu, 10), password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al ingresar')
        return
      }
      if (data.must_change_password) {
        router.push('/cambiar-password')
      } else {
        router.push(data.is_admin ? '/elegir-modo' : '/inicio')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1c2b4b] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <p className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-2">
              COOPV MENDOZA
            </p>
            <h1 className="text-2xl font-bold text-slate-900">Bienvenido</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nsu" className="block text-sm font-medium text-gray-700 mb-1.5">
                Número de Socio (NSU)
              </label>
              <input
                id="nsu"
                type="number"
                inputMode="numeric"
                value={nsu}
                onChange={e => setNsu(e.target.value)}
                placeholder="Ej: 56483"
                required
                autoFocus
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-xl text-center text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-xl text-center text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b] focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !nsu || !password}
              className="w-full bg-[#1c2b4b] text-white rounded-xl py-3.5 font-semibold text-base hover:bg-[#243764] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            La primera vez, usá tu NSU como contraseña.
          </p>
        </div>
      </div>
    </div>
  )
}
