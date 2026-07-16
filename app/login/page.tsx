'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [nsu, setNsu] = useState('')
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
        body: JSON.stringify({ nsu: parseInt(nsu, 10) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al ingresar')
        return
      }
      router.push(data.is_admin ? '/admin' : '/catalogo')
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            🌿
          </div>
          <h1 className="text-2xl font-bold text-gray-900">COOPV Mendoza</h1>
          <p className="text-sm text-gray-500 mt-1">Unidad de Abastecimiento</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
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
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-xl text-center focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !nsu}
            className="w-full bg-green-700 text-white rounded-xl py-3.5 font-semibold text-base hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-5">
          ¿Problemas para ingresar? Contactá a la coordinación.
        </p>
      </div>
    </div>
  )
}
