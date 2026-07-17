'use client'

import { useState, useEffect } from 'react'

interface Comunicado {
  id: string
  asunto: string
  mensaje: string
  emoji: string
  created_at: string
}

const EMOJI_OPTIONS = ['📢', '🍷', '📦', '🌿', '⭐', '📅', '🔔', '✅']

export default function AdminComunicadosPage() {
  const [comunicados, setComunicados] = useState<Comunicado[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [asunto, setAsunto] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [emoji, setEmoji] = useState('📢')

  useEffect(() => {
    fetch('/api/admin/comunicados')
      .then(r => r.json())
      .then((data: Comunicado[]) => { setComunicados(data); setLoadingList(false) })
      .catch(() => setLoadingList(false))
  }, [])

  async function enviar(e: { preventDefault(): void }) {
    e.preventDefault()
    setSending(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/comunicados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asunto, mensaje, emoji }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Error al publicar')
        return
      }
      setComunicados(prev => [data as Comunicado, ...prev])
      setAsunto('')
      setMensaje('')
      setEmoji('📢')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Error de conexión')
    } finally {
      setSending(false)
    }
  }

  async function eliminar(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/comunicados/${id}`, { method: 'DELETE' })
      if (res.ok) setComunicados(prev => prev.filter(c => c.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="p-5 max-w-lg">
      <h1 className="font-bold text-gray-900 text-lg mb-1">Comunicados</h1>
      <p className="text-xs text-gray-400 mb-5">
        Los avisos publicados acá aparecen en la página de inicio de los socios.
      </p>

      <form onSubmit={enviar} className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ícono</label>
          <div className="flex gap-2 flex-wrap">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-colors ${
                  emoji === e
                    ? 'bg-[#1c2b4b] text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Título del aviso</label>
          <input
            type="text"
            value={asunto}
            onChange={e => setAsunto(e.target.value)}
            placeholder="Ej: Nuevo producto disponible"
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descripción</label>
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Escribí el detalle del aviso para los socios..."
            required
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b] resize-none"
          />
        </div>

        {error && (
          <p className="text-red-600 text-xs">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-xs font-medium">✅ Aviso publicado correctamente</p>
        )}

        <button
          type="submit"
          disabled={sending || !asunto.trim() || !mensaje.trim()}
          className="w-full bg-[#1c2b4b] text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#243764] transition-colors"
        >
          {sending ? 'Publicando...' : 'Publicar aviso'}
        </button>
      </form>

      <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
        Historial reciente
      </p>

      {loadingList ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : comunicados.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm">Todavía no hay avisos publicados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comunicados.map(c => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{c.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-snug">{c.asunto}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">{c.mensaje}</p>
                <p className="text-xs text-gray-300 mt-1.5">{formatDate(c.created_at)}</p>
              </div>
              <button
                onClick={() => eliminar(c.id)}
                disabled={deleting === c.id}
                className="text-gray-300 hover:text-red-400 transition-colors text-sm flex-shrink-0 disabled:opacity-50"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
