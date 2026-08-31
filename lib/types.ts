export interface Socio {
  id: string
  nsu: number
  nombre: string
  tipo: 'mendoza' | 'visitante'
  curso: string | null
  is_admin: boolean
  activo: boolean
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  precio: number
  productor: string | null
  disponible: boolean
  notas: string | null
  stock: number | null
  detalles: string | null
  contribuidor_email: string | null
  imagen_url: string | null
  max_por_pedido: number | null
  created_at: string
}

export interface FechaEntrega {
  id: string
  fecha: string
  descripcion: string | null
  activa: boolean
}

export interface PedidoItem {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  producto?: Pick<Producto, 'nombre' | 'precio'>
}

export interface Pedido {
  id: string
  socio_id: string
  fecha_entrega_id: string | null
  estado: 'confirmado' | 'entregado' | 'cancelado'
  confirmed_at: string
  created_at: string
  socio?: Pick<Socio, 'nsu' | 'nombre'>
  items?: PedidoItem[]
  fecha_entrega?: FechaEntrega | null
}

export interface SessionPayload {
  socio_id: string
  nsu: number
  nombre: string
  is_admin: boolean
}

export interface CartItem {
  producto_id: string
  nombre: string
  precio: number
  productor: string | null
  cantidad: number
}
