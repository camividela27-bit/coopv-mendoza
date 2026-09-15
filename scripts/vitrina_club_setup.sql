-- Crear tabla vitrina_club (si no existe ya)
CREATE TABLE IF NOT EXISTS vitrina_club (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  categoria text,
  precio integer not null,
  stock integer,
  observaciones text,
  imagen_url text,
  disponible boolean default true,
  orden integer default 0,
  created_at timestamptz default now()
);

-- Insertar los 29 productos de la planilla
INSERT INTO vitrina_club (nombre, categoria, precio, stock, observaciones, orden) VALUES

-- ALIMENTOS
('Aceite oliva D. Oscar x 1 lt',                                      'Alimentos', 14600, NULL,  '1 por persona',          10),
('Aceite girasol Natura x 900 ml',                                    'Alimentos',  4260,    6,  NULL,                     20),
('Combo Pasta aceitunas DP x 280 gr + Aceitunas verdes descarozadas DP x 140 gr + Aceitunas Salmuera DP x 160 gr', 'Alimentos', 4160, 5, 'Combo de 3 unidades', 30),
('Aceitunas griegas Amigo para Amigo cosecha 2026',                   'Alimentos',  3800, NULL,  NULL,                     40),
('Azucar Ledesma x 1 kg',                                             'Alimentos',  1300,   12,  NULL,                     50),
('Galletas Hojalmar Veggie Larguitas x 150 gr',                       'Alimentos',  1100,    9,  NULL,                     60),
('Miel pote x 1 kg De Cnel. Dorrego',                                 'Alimentos',  6300,   10,  NULL,                     70),

-- CONDIMENTOS
('Combo Jengibre Mardegan fco. x 85 gr + Curry fco. x 75 gr + Canela fco. x 65 gr', 'Condimentos', 2700, 3, 'Combo de 3 unidades', 10),
('Combo Cilantro granos fco. x 50 gr + Condimento para arroz x 90 gr + Mostaza en granos fco. x 115 gr + Cebolla en polvo x 100 gr', 'Condimentos', 3650, 1, 'Combo de 4 unidades', 20),
('Ketchup Heinz x 190 gr',                                            'Condimentos', 2430,    2,  NULL,                     30),

-- LIMPIEZA
('Rollo papel higiénico Higienol 4 x 30 DH',                         'Limpieza',   3470,   10,  NULL,                     10),
('Papel cocina Sussex 3x50',                                          'Limpieza',   2400,   10,  NULL,                     20),
('Papel Aro family 1 x 200 paños',                                    'Limpieza',   2700,   10,  NULL,                     30),
('Combo CIF limpiapisos repuesto + CIF Bioactive antigrasa',          'Limpieza',   6100,    4,  'Combo 2 unid.',           40),

-- HIGIENE PERSONAL
('Jabón Dove x 90 gr',                                                'Higiene Personal', 1900, 10, NULL,                  10),
('Juego de Toalla y Toallón CANNON color crema',                      'Higiene Personal', 27000, 6, NULL,                  20),
('Juego de Toalla y Toallón CANNON color blanco',                     'Higiene Personal', 27000, 6, NULL,                  30),

-- ARMONIZADORES
('Incienso Sathya Rose',                                              'Armonizadores', 1250, 10, NULL,                     10),
('Incienso Super Hit',                                                'Armonizadores', 1250, 10, NULL,                     20),
('Incienso Vainilla',                                                 'Armonizadores', 1250,  6, NULL,                     30),
('Incienso Frankincense',                                             'Armonizadores', 1250,  6, NULL,                     40),
('Incienso Citronella',                                               'Armonizadores', 1250,  6, NULL,                     50),
('Incienso Padmini tubo x 20 varillas',                               'Armonizadores', 1240,  6, NULL,                     60),
('Incienso Buda importado caja x 7 varillas',                         'Armonizadores', 1240,  6, NULL,                     70),

-- PASTAS SECAS
('Tallerines de trigo candeal de Cnel. Dorrego paq. x 500 gr',       'Pastas Secas', 1260, NULL, NULL,                    10),

-- VINOS
('Vino Juntos caja x 6 u. Amigo para Amigo',                         'Vinos',      50000, NULL, NULL,                     10),
('Vino Juntos por unidad Amigo para Amigo',                           'Vinos',       8350, NULL, NULL,                     20),
('Combo Vino INTA Syrah + Vino INTA Reserva + Caballero de la Cepa', 'Vinos',       9000,    4, 'Combo de 3 unidades',    30),
('Combo Vino Funky Malbec + Vino Parece pero no lo es + Vino Partridge Chardonnay', 'Vinos', 12000, 1, 'Combo de 3 unidades', 40);
