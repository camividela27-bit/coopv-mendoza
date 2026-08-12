'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/app/components/AppHeader'

interface Aviso {
  id: string
  emoji: string
  asunto: string
  mensaje: string
}

interface Fecha {
  id: string
  fecha: string | null
  descripcion: string
  activa: boolean
}

const FALLBACK_AVISOS: Aviso[] = [
  { id: 'f1', emoji: '🍷', asunto: 'Vino JUNTOS disponible', mensaje: 'Individual y en caja de 6 unidades. ¡Encontralo en el catálogo!' },
  { id: 'f2', emoji: '📦', asunto: 'Nuevos productos de Amigos', mensaje: 'Se sumaron más productos y variedades en los productos.' },
]

function formatFecha(fechaStr: string | null): string {
  if (!fechaStr) return ''
  const d = new Date(fechaStr + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, c => c.toUpperCase())
}

export default function InicioPage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [avisosReady, setAvisosReady] = useState(false)
  const [fechas, setFechas] = useState<Fecha[]>([])

  useEffect(() => {
    const raw = document.cookie
      .split('; ')
      .find(r => r.startsWith('nombre='))
      ?.split('=')[1]
    if (raw) setNombre(raw)

    fetch('/api/avisos')
      .then(r => r.json())
      .then((data: Aviso[]) => {
        setAvisos(Array.isArray(data) && data.length > 0 ? data : FALLBACK_AVISOS)
        setAvisosReady(true)
      })
      .catch(() => {
        setAvisos(FALLBACK_AVISOS)
        setAvisosReady(true)
      })

    fetch('/api/fechas')
      .then(r => r.json())
      .then((data: unknown) => { if (Array.isArray(data)) setFechas(data as Fecha[]) })
      .catch(() => {})
  }, [])

  const displayAvisos = avisosReady ? avisos : FALLBACK_AVISOS

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-lg mx-auto px-4 py-6 pb-10">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">
            {nombre ? `Hola, ${nombre} 👋` : 'Hola 👋'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Bienvenido a la cooperativa</p>
        </div>

        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
          Próximas Cooperativas
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 mb-7">
          {fechas.length === 0 ? (
            <div className="p-4 text-sm text-gray-400 text-center">Sin fechas próximas</div>
          ) : (
            fechas.map(f => (
              <div key={f.id} className="p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">{f.fecha ? formatFecha(f.fecha) : f.descripcion}</p>
                  {f.fecha && <p className="text-sm text-gray-500 mt-0.5">{f.descripcion}</p>}
                </div>
              </div>
            ))
          )}
        </div>

        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">
          Avisos
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 mb-8">
          {displayAvisos.map(a => (
            <div key={a.id} className="p-4">
              <p className="font-semibold text-gray-900 leading-snug">
                {a.emoji} {a.asunto}
              </p>
              <p className="text-sm text-gray-500 mt-1">{a.mensaje}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/catalogo')}
          className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-amber-700 transition-colors"
        >
          Hacer mi pedido →
        </button>
      </div>
    </div>
  )
}
