-- COOPV Mendoza — Esquema de base de datos
-- Ejecutar en: Supabase > SQL Editor > New query

-- Tabla de socios (members)
create table if not exists socios (
  id           uuid primary key default gen_random_uuid(),
  nsu          integer unique not null,
  nombre       text not null,
  tipo         text not null default 'mendoza' check (tipo in ('mendoza', 'visitante')),
  curso        text,
  is_admin     boolean not null default false,
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Tabla de productos (pilot: solo Productos de Amigos)
create table if not exists productos (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  precio       numeric(10,2) not null check (precio >= 0),
  productor    text,
  disponible   boolean not null default true,
  notas        text,
  created_at   timestamptz not null default now()
);

-- Fechas de entrega (primer viernes del mes en Sede)
create table if not exists fechas_entrega (
  id           uuid primary key default gen_random_uuid(),
  fecha        date not null,
  descripcion  text,
  activa       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Pedidos
create table if not exists pedidos (
  id               uuid primary key default gen_random_uuid(),
  socio_id         uuid not null references socios(id),
  fecha_entrega_id uuid references fechas_entrega(id),
  estado           text not null default 'confirmado' check (estado in ('confirmado', 'entregado', 'cancelado')),
  confirmed_at     timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

-- Ítems del pedido (precio congelado al momento de la confirmación)
create table if not exists pedido_items (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references pedidos(id) on delete cascade,
  producto_id     uuid not null references productos(id),
  cantidad        integer not null check (cantidad > 0),
  precio_unitario numeric(10,2) not null,
  created_at      timestamptz not null default now()
);

-- Deshabilitar RLS para el piloto (app interna, 104 socios)
alter table socios         disable row level security;
alter table productos      disable row level security;
alter table fechas_entrega disable row level security;
alter table pedidos        disable row level security;
alter table pedido_items   disable row level security;

-- Próxima fecha de entrega de ejemplo
insert into fechas_entrega (fecha, descripcion)
values (
  date_trunc('month', now()) + interval '4 days' +
    (5 - extract(dow from date_trunc('month', now()) + interval '4 days'))::integer * interval '1 day',
  'Retiro en Sede — Primer viernes del mes'
)
on conflict do nothing;
