'use client'

import { useState, useEffect, useRef } from 'react'

interface Novedad {
  id: string
  titulo: string
  descripcion: string | null
  imagen_url: string | null
  etiqueta: string | null
  activo: boolean
  orden: number
}

const ETIQUETAS = ['Promo', 'Nuevo', 'Temporada', 'Permanente', 'Destacado']

export default function AdminClubPage() {
  const [novedades, setNovedades] = useState<Novedad[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [etiqueta, setEtiqueta] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/novedades')
      .then(r => r.json())
      .then((data: Novedad[]) => { setNovedades(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok) { setError(data.error ?? 'Error al subir imagen'); return }
      setImagenUrl(data.url ?? '')
    } finally {
      setUploading(false)
    }
  }

  async function agregar(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/novedades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion, etiqueta: etiqueta || null, imagen_url: imagenUrl || null }),
      })
      const data = await res.json() as Novedad & { error?: string }
      if (!res.ok) { setError(data.error ?? 'Error al guardar'); return }
      setNovedades(prev => [data, ...prev])
      setTitulo(''); setDescripcion(''); setEtiqueta(''); setImagenUrl('')
      if (fileRef.current) fileRef.current.value = ''
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setSending(false)
    }
  }

  async function toggleActivo(id: string, current: boolean) {
    setActing(id)
    try {
      const res = await fetch(`/api/admin/novedades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !current }),
      })
      if (res.ok) setNovedades(prev => prev.map(n => n.id === id ? { ...n, activo: !current } : n))
    } finally { setActing(null) }
  }

  async function eliminar(id: string, titulo: string) {
    if (!window.confirm(`¿Eliminar "${titulo}"?`)) return
    setActing(id)
    try {
      const res = await fetch(`/api/admin/novedades/${id}`, { method: 'DELETE' })
      if (res.ok) setNovedades(prev => prev.filter(n => n.id !== id))
    } finally { setActing(null) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  const activas = novedades.filter(n => n.activo)
  const inactivas = novedades.filter(n => !n.activo)

  return (
    <div className="p-5 max-w-lg">
      <h1 className="font-bold text-gray-900 text-lg mb-1">En el Club</h1>
      <p className="text-xs text-gray-400 mb-5">Productos y promociones disponibles en persona en el club.</p>

      {/* Formulario */}
      <form onSubmit={agregar} className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ej: Aceite de oliva premium"
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descripción <span className="font-normal text-gray-400">(opcional)</span></label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Detalles del producto o la promo..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Etiqueta <span className="font-normal text-gray-400">(opcional)</span></label>
          <div className="flex flex-wrap gap-2 mb-2">
            {ETIQUETAS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setEtiqueta(etiqueta === tag ? '' : tag)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                  etiqueta === tag
                    ? 'bg-[#1c2b4b] text-white border-[#1c2b4b]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={etiqueta}
            onChange={e => setEtiqueta(e.target.value)}
            placeholder="O escribí una personalizada"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Imagen <span className="font-normal text-gray-400">(opcional)</span></label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          {uploading && <p className="text-xs text-gray-400 mt-1.5">Subiendo imagen...</p>}
          {imagenUrl && !uploading && (
            <div className="mt-2 relative">
              <img src={imagenUrl} alt="preview" className="w-full rounded-xl object-cover max-h-40" />
              <button
                type="button"
                onClick={() => { setImagenUrl(''); if (fileRef.current) fileRef.current.value = '' }}
                className="absolute top-2 right-2 bg-white/90 text-gray-600 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-xs">{error}</p>}
        {success && <p className="text-green-600 text-xs font-medium">✅ Publicado en el Club</p>}

        <button
          type="submit"
          disabled={sending || uploading || !titulo.trim()}
          className="w-full bg-[#1c2b4b] text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-[#243764] transition-colors"
        >
          {sending ? 'Publicando...' : '+ Publicar en el Club'}
        </button>
      </form>

      {/* Publicadas */}
      {activas.length > 0 && (
        <>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Publicadas ({activas.length})</p>
          <div className="space-y-3 mb-5">
            {activas.map(n => (
              <div key={n.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {n.imagen_url && (
                  <img src={n.imagen_url} alt={n.titulo} className="w-full object-cover max-h-32" />
                )}
                <div className="p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {n.etiqueta && (
                      <span className="inline-block text-xs font-semibold bg-[#1c2b4b] text-white px-2 py-0.5 rounded-full mb-1">{n.etiqueta}</span>
                    )}
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{n.titulo}</p>
                    {n.descripcion && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.descripcion}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleActivo(n.id, n.activo)}
                      disabled={acting === n.id}
                      className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Ocultar
                    </button>
                    <button
                      onClick={() => eliminar(n.id, n.titulo)}
                      disabled={acting === n.id}
                      className="text-gray-300 hover:text-red-400 transition-colors text-sm disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Ocultas */}
      {inactivas.length > 0 && (
        <>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Ocultas</p>
          <div className="space-y-2">
            {inactivas.map(n => (
              <div key={n.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3 opacity-50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-500 text-sm line-through leading-snug">{n.titulo}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleActivo(n.id, n.activo)}
                    disabled={acting === n.id}
                    className="text-xs bg-[#1c2b4b] text-white px-2.5 py-1.5 rounded-lg font-medium hover:bg-[#243764] transition-colors disabled:opacity-50"
                  >
                    Publicar
                  </button>
                  <button
                    onClick={() => eliminar(n.id, n.titulo)}
                    disabled={acting === n.id}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm disabled:opacity-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {novedades.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">Todavía no hay nada publicado en el Club.</p>
        </div>
      )}
    </div>
  )
}
