'use client'

import { useState, useEffect, useRef } from 'react'
import type { Producto } from '@/lib/types'

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({})
  const [emailDraft, setEmailDraft] = useState<Record<string, string>>({})
  const [categoriaDraft, setCategoriaDraft] = useState<Record<string, string>>({})

  const CATEGORIAS = ['', 'Alimentos', 'Dulces', 'Aromas y velas', 'Regalería']
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [photoOpenId, setPhotoOpenId] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetch('/api/admin/productos')
      .then(r => r.json())
      .then((data: Producto[]) => {
        setProductos(data)
        const drafts: Record<string, string> = {}
        const emails: Record<string, string> = {}
        const cats: Record<string, string> = {}
        for (const p of data) {
          drafts[p.id] = p.stock != null ? String(p.stock) : ''
          emails[p.id] = p.contribuidor_email ?? ''
          cats[p.id] = p.categoria ?? ''
        }
        setCategoriaDraft(cats)
        setStockDraft(drafts)
        setEmailDraft(emails)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function toggleDisponible(id: string, current: boolean) {
    setToggling(id)
    try {
      const res = await fetch(`/api/admin/productos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disponible: !current }),
      })
      if (res.ok) {
        setProductos(prev =>
          prev.map(p => p.id === id ? { ...p, disponible: !current } : p)
        )
      }
    } finally {
      setToggling(null)
    }
  }

  async function saveCategoria(id: string, value: string) {
    setCategoriaDraft(prev => ({ ...prev, [id]: value }))
    await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria: value || null }),
    })
    setProductos(prev =>
      prev.map(p => p.id === id ? { ...p, categoria: value || null } : p)
    )
  }

  async function saveEmail(id: string) {
    const email = emailDraft[id]?.trim() ?? ''
    await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contribuidor_email: email }),
    })
    setProductos(prev =>
      prev.map(p => p.id === id ? { ...p, contribuidor_email: email || null } : p)
    )
  }

  async function saveStock(id: string) {
    const raw = stockDraft[id]
    const stock = raw === '' ? null : parseInt(raw, 10)
    if (raw !== '' && isNaN(stock as number)) return

    const res = await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock }),
    })
    if (res.ok) {
      setProductos(prev =>
        prev.map(p => p.id === id ? { ...p, stock } : p)
      )
    }
  }

  async function handlePhotoChange(id: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingId(id)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json() as { url?: string; error?: string }
      if (!res.ok || !data.url) return
      await fetch(`/api/admin/productos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagen_url: data.url }),
      })
      setProductos(prev => prev.map(p => p.id === id ? { ...p, imagen_url: data.url ?? null } : p))
      setPhotoOpenId(null)
    } finally {
      setUploadingId(null)
    }
  }

  async function removePhoto(id: string) {
    await fetch(`/api/admin/productos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagen_url: null }),
    })
    setProductos(prev => prev.map(p => p.id === id ? { ...p, imagen_url: null } : p))
  }

  function getStatus(p: Producto) {
    if (!p.disponible) return 'oculto'
    if (p.stock === 0) return 'sin_stock'
    return 'disponible'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando productos...</p>
      </div>
    )
  }

  const disponibles = productos.filter(p => p.disponible).length

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-bold text-gray-900 text-lg">
            Productos ({productos.length})
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {disponibles} disponibles · {productos.length - disponibles} ocultos
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
        <p className="text-xs text-blue-700">
          Ingresá la cantidad disponible en <strong>Stock</strong>. Dejalo vacío para stock ilimitado. Con 0 aparece como "Sin stock" en el catálogo.
        </p>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-gray-500">No hay productos cargados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {productos.map(producto => {
            const status = getStatus(producto)
            const isOpen = photoOpenId === producto.id
            const isUploading = uploadingId === producto.id
            return (
              <div
                key={producto.id}
                className={`bg-white rounded-2xl border overflow-hidden ${
                  !producto.disponible ? 'opacity-60 border-gray-100' : 'border-gray-200'
                }`}
              >
                {producto.imagen_url && (
                  <div className="relative">
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-full object-cover max-h-28"
                    />
                    <button
                      onClick={() => removePhoto(producto.id)}
                      className="absolute top-1.5 right-1.5 bg-white/90 text-gray-500 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow"
                      title="Quitar foto"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold leading-snug ${!producto.disponible ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {producto.nombre}
                        </p>
                        {status === 'disponible' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Disponible
                          </span>
                        )}
                        {status === 'sin_stock' && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Sin stock
                          </span>
                        )}
                        {status === 'oculto' && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                            Oculto
                          </span>
                        )}
                      </div>
                      {producto.detalles && (
                        <p className="text-xs text-gray-400 mt-0.5">{producto.detalles}</p>
                      )}
                      {producto.productor && (
                        <p className="text-xs text-gray-400">{producto.productor}</p>
                      )}
                      <p className="text-sm font-semibold text-[#1c2b4b] mt-1">
                        ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-xs text-gray-400">✉️</span>
                        <input
                          type="email"
                          placeholder="email del amigo"
                          value={emailDraft[producto.id] ?? ''}
                          onChange={e => setEmailDraft(prev => ({ ...prev, [producto.id]: e.target.value }))}
                          onBlur={() => saveEmail(producto.id)}
                          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#1c2b4b]"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-gray-400">🏷</span>
                        <select
                          value={categoriaDraft[producto.id] ?? ''}
                          onChange={e => saveCategoria(producto.id, e.target.value)}
                          className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1c2b4b] bg-white"
                        >
                          <option value="">Sin categoría</option>
                          {CATEGORIAS.filter(c => c).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleDisponible(producto.id, producto.disponible)}
                        disabled={toggling === producto.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ${
                          producto.disponible
                            ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                            : 'bg-[#1c2b4b] text-white hover:bg-[#243764]'
                        }`}
                      >
                        {toggling === producto.id ? '...' : producto.disponible ? 'Ocultar' : 'Activar'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <label className="text-xs text-gray-400">Stock</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="∞"
                          value={stockDraft[producto.id] ?? ''}
                          onChange={e => setStockDraft(prev => ({ ...prev, [producto.id]: e.target.value }))}
                          onBlur={() => saveStock(producto.id)}
                          onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1c2b4b]"
                        />
                      </div>

                      <button
                        onClick={() => setPhotoOpenId(isOpen ? null : producto.id)}
                        className="text-xs text-gray-400 hover:text-[#1c2b4b] transition-colors"
                      >
                        {producto.imagen_url ? '🖼 Cambiar foto' : '📷 Foto'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <input
                        ref={el => { fileRefs.current[producto.id] = el }}
                        type="file"
                        accept="image/*"
                        onChange={e => handlePhotoChange(producto.id, e)}
                        className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      />
                      {isUploading && <p className="text-xs text-gray-400 mt-1">Subiendo...</p>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
