'use client'

interface Props {
  habilitado: boolean
  descripcion: string | null
}

export default function PedidosBanner({ habilitado, descripcion }: Props) {
  if (habilitado && !descripcion) return null

  if (!habilitado) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2.5">
        <span className="text-lg">🔒</span>
        <div>
          <p className="text-sm font-semibold text-red-800">Pedidos cerrados</p>
          <p className="text-xs text-red-600">Por el momento no se reciben nuevos pedidos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-2.5">
      <span className="text-lg">📢</span>
      <p className="text-sm font-semibold text-amber-800">{descripcion}</p>
    </div>
  )
}
