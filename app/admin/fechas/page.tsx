'use client'

import { useState, useEffect } from 'react'

interface FechaEntrega {
  id: string
  fecha: string | null
  descripcion: string
  activa: boolean
  habilitado: boolean
}

function formatFecha(fecha: string | null) {
  if (!fecha) return null
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function AdminFechasPage() {
  const [fechas, setFechas] = useState<FechaEntrega[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [fecha, setFecha] = useState('')
  const [descripcion, setDescripcion] = useState('')

  useEffect(() => {
    fetch('/api/admin/fechas')
      .then(r => r.json())
      .then((data: FechaEntrega[]) => { setFechas(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function agregar(e: { preventDefault(): void }) {
    e.preventDefault()
    setSending(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/fechas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fecha: fecha || null, descripcion }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error al guardar'); return }
      setFechas(prev => [...prev, data as FechaEntrega].sort((a, b) =>
        (a.fecha ?? '9999') < (b.fecha ?? '9999') ? -1 : 1
      ))
      setFecha('')
      setDescripcion('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Error de conexión')
    } finally {
      setSending(false)
    }
  }

  async function toggleActiva(id: string, current: boolean) {
    setActing(id)
    try {
      const res = await fetch(`/api/admin/fechas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activa: !current }),
      })
      if (res.ok) setFechas(prev => prev.map(f => f.id === id ? { ...f, activa: !current } : f))
    } finally {
      setActing(null)
    }
  }

  async function toggleHabilitado(id: string, current: boolean) {
    setActing(id)
    try {
      const res = await fetch(`/api/admin/fechas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habilitado: !current }),
      })
      if (res.ok) setFechas(prev => prev.map(f => f.id === id ? { ...f, habilitado: !current } : f))
    } finally {
      setActing(null)
    }
  }

  async function eliminar(id: string, desc: string) {
    if (!window.confirm(`¿Eliminar "${desc}"?`)) return
    setActing(id)
    try {
      const res = await fetch(`/api/admin/fechas/${id}`, { method: 'DELETE' })
      if (res.ok) setFechas(prev => prev.filter(f => f.id !== id))
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Cargando fechas...</p>
      </div>
    )
  }

  const activas = fechas.filter(f => f.activa)
  const inactivas = fechas.filter(f => !f.activa)

  return (
    <div className="p-5 max-w-lg">
      <h1 className="font-bold text-gray-900 text-lg mb-1">Fechas de entrega</h1>
      <p className="text-xs text-gray-400 mb-5">
        Las fechas activas aparecen como opciones al confirmar un pedido.
      </p>

      {/* Formulario */}
      <form onSubmit={agregar} className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descripción de la fecha</label>
          <input
            type="text"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Ej: Retiro en sede — viernes 14 de agosto"
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            Fecha <span className="font-normal text-gray-400">(opcional si es "a confirmar")</span>
          </label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1c2b4b]"
          />
        </div>

        {error && <p className="text-red-600 text-xs">{error}</p>}
        {success && <p className="text-green-600 text-xs font-medium">✅ Fecha agregada</p>}

        <button
          type="submit"
          disabled={sending || !descripcion.trim()}
          className="w-full bg-[#1c2b4b] text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-[#243764] transition-colors"
        >
          {sending ? 'Guardando...' : '+ Agregar fecha'}
        </button>
      </form>

      {/* Activas */}
      {activas.length > 0 && (
        <>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Activas ({activas.length})</p>
          <div className="space-y-2 mb-5">
            {activas.map(f => (
              <div key={f.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm leading-snug">{f.descripcion}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      f.habilitado !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {f.habilitado !== false ? '🟢 Abiertos' : '🔒 Cerrados'}
                    </span>
                  </div>
                  {f.fecha && (
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{formatFecha(f.fecha)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleHabilitado(f.id, f.habilitado !== false)}
                    disabled={acting === f.id}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      f.habilitado !== false
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {acting === f.id ? '...' : f.habilitado !== false ? '🔒 Cerrar pedidos' : '🔓 Abrir pedidos'}
                  </button>
                  <button
                    onClick={() => toggleActiva(f.id, f.activa)}
                    disabled={acting === f.id}
                    className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Desactivar
                  </button>
                  <button
                    onClick={() => eliminar(f.id, f.descripcion)}
                    disabled={acting === f.id}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm disabled:opacity-50"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Inactivas */}
      {inactivas.length > 0 && (
        <>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">Inactivas</p>
          <div className="space-y-2">
            {inactivas.map(f => (
              <div key={f.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 opacity-50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-500 text-sm line-through leading-snug">{f.descripcion}</p>
                  {f.fecha && (
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{formatFecha(f.fecha)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActiva(f.id, f.activa)}
                    disabled={acting === f.id}
                    className="text-xs bg-[#1c2b4b] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#243764] transition-colors disabled:opacity-50"
                  >
                    Activar
                  </button>
                  <button
                    onClick={() => eliminar(f.id, f.descripcion)}
                    disabled={acting === f.id}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm disabled:opacity-50"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {fechas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-sm">No hay fechas cargadas todavía.</p>
        </div>
      )}
    </div>
  )
}
