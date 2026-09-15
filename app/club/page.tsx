'use client'

import { useEffect, useState } from 'react'
import AppHeader from '@/app/components/AppHeader'

interface Novedad {
  id: string
  titulo: string
  descripcion: string | null
  imagen_url: string | null
  etiqueta: string | null
}

interface VitrinaItem {
  id: string
  nombre: string
  categoria: string | null
  precio: number
  stock: number | null
  observaciones: string | null
  imagen_url: string | null
}

const ORDEN_CATEGORIAS = ['Alimentos', 'Condimentos', 'Limpieza', 'Higiene Personal', 'Armonizadores', 'Pastas Secas', 'Vinos']

export default function ClubPage() {
  const [novedades, setNovedades] = useState<Novedad[]>([])
  const [vitrina, setVitrina] = useState<VitrinaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/novedades').then(r => r.json()).catch(() => []),
      fetch('/api/vitrina').then(r => r.json()).catch(() => []),
    ]).then(([nov, vit]) => {
      if (Array.isArray(nov)) setNovedades(nov as Novedad[])
      if (Array.isArray(vit)) setVitrina(vit as VitrinaItem[])
    }).finally(() => setLoading(false))
  }, [])

  const categorias = ORDEN_CATEGORIAS.filter(cat =>
    vitrina.some(p => p.categoria === cat)
  )
  const sinCategoria = vitrina.filter(p => !p.categoria || !ORDEN_CATEGORIAS.includes(p.categoria))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <AppHeader />
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">En el Club</h1>
          <p className="text-sm text-gray-500 mt-0.5">Productos disponibles en persona en la sede</p>
        </div>

        {novedades.length > 0 && (
          <div className="space-y-4 mb-8">
            {novedades.map(n => (
              <div key={n.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {n.imagen_url && (
                  <img src={n.imagen_url} alt={n.titulo} className="w-full object-cover" style={{ maxHeight: '260px' }} />
                )}
                <div className="p-4">
                  {n.etiqueta && (
                    <span className="inline-block text-xs font-semibold bg-[#1c2b4b] text-white px-2.5 py-1 rounded-full mb-2">
                      {n.etiqueta}
                    </span>
                  )}
                  <p className="font-bold text-gray-900 text-base leading-snug">{n.titulo}</p>
                  {n.descripcion && (
                    <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{n.descripcion}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {vitrina.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base font-bold text-gray-900">Productos disponibles</span>
              <span className="text-xs bg-[#1c2b4b] text-white px-2.5 py-1 rounded-full font-semibold">Solo en sede</span>
            </div>

            <div className="space-y-6">
              {categorias.map(cat => (
                <div key={cat}>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">{cat}</p>
                  <div className="space-y-2">
                    {vitrina.filter(p => p.categoria === cat).map(p => (
                      <VitrinaCard key={p.id} item={p} />
                    ))}
                  </div>
                </div>
              ))}
              {sinCategoria.length > 0 && (
                <div className="space-y-2">
                  {sinCategoria.map(p => <VitrinaCard key={p.id} item={p} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {novedades.length === 0 && vitrina.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🏡</p>
            <p className="text-gray-500 font-medium">Pronto habrá novedades del club.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function VitrinaCard({ item }: { item: VitrinaItem }) {
  const sinStock = item.stock === 0
  const stockLibre = item.stock === null

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden ${sinStock ? 'opacity-50 border-gray-100' : 'border-gray-200'}`}>
      {item.imagen_url && (
        <img src={item.imagen_url} alt={item.nombre} className="w-full object-cover" style={{ maxHeight: '180px' }} />
      )}
      <div className="p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 leading-snug text-sm">{item.nombre}</p>
          {item.observaciones && (
            <p className="text-xs text-gray-400 mt-0.5">{item.observaciones}</p>
          )}
          {!stockLibre && !sinStock && (
            <p className="text-xs text-amber-600 mt-0.5 font-medium">{item.stock} disponibles</p>
          )}
          {sinStock && (
            <p className="text-xs text-red-400 mt-0.5 font-medium">Sin stock</p>
          )}
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-bold text-[#1c2b4b] text-base">
            ${item.precio.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  )
}
