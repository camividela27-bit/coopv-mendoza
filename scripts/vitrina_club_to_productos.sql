-- Agregar columna solo_club a productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS solo_club boolean default false;

-- Insertar los 29 productos del Club con solo_club = true
-- (usan el mismo carrito y sistema de pedidos que el catálogo)

INSERT INTO productos (nombre, precio, productor, disponible, stock, notas, imagen_url, categoria, solo_club, max_por_pedido) VALUES

-- ALIMENTOS
('Aceite oliva D. Oscar x 1 lt',
 14600, 'Don Oscar', true, NULL, '1 por persona',
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/aceite-oliva-oscar.png',
 'Alimentos', true, 1),

('Aceite girasol Natura x 900 ml',
 4260, 'Natura', true, 6, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/aceite-girasol-natura.png',
 'Alimentos', true, NULL),

('Combo Pasta aceitunas DP x 280 gr + Aceitunas verdes descarozadas DP x 140 gr + Aceitunas Salmuera DP x 160 gr',
 4160, 'Don Pascual', true, 5, 'Combo de 3 unidades',
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/combo-aceitunas.png',
 'Alimentos', true, NULL),

('Aceitunas griegas Amigo para Amigo cosecha 2026',
 3800, NULL, true, NULL, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/aceitunas-griegas.png',
 'Alimentos', true, NULL),

('Azucar Ledesma x 1 kg',
 1300, 'Ledesma', true, 12, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/azucar-ledesma.png',
 'Alimentos', true, NULL),

('Galletas Hojalmar Veggie Larguitas x 150 gr',
 1100, 'Hojalmar', true, 9, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/galletas-hojalmar.png',
 'Alimentos', true, NULL),

('Miel pote x 1 kg De Cnel. Dorrego',
 6300, NULL, true, 10, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/miel-dorrego.png',
 'Alimentos', true, NULL),

-- CONDIMENTOS
('Combo Jengibre Mardegan fco. x 85 gr + Curry fco. x 75 gr + Canela fco. x 65 gr',
 2700, 'Mardegan', true, 3, 'Combo de 3 unidades',
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/combo-jengibre.png',
 'Condimentos', true, NULL),

('Combo Cilantro granos fco. x 50 gr + Condimento para arroz x 90 gr + Mostaza en granos fco. x 115 gr + Cebolla en polvo x 100 gr',
 3650, NULL, true, 1, 'Combo de 4 unidades',
 NULL,
 'Condimentos', true, NULL),

('Ketchup Heinz x 190 gr',
 2430, 'Heinz', true, 2, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/ketchup-heinz.png',
 'Condimentos', true, NULL),

-- LIMPIEZA
('Rollo papel higiénico Higienol 4 x 30 DH',
 3470, 'Higienol', true, 10, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/papel-higienico.png',
 'Limpieza', true, NULL),

('Papel cocina Sussex 3x50',
 2400, 'Sussex', true, 10, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/papel-cocina-sussex.png',
 'Limpieza', true, NULL),

('Papel Aro family 1 x 200 paños',
 2700, 'Aro', true, 10, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/papel-aro-200.png',
 'Limpieza', true, NULL),

('Combo CIF limpiapisos repuesto + CIF Bioactive antigrasa',
 6100, 'CIF', true, 4, 'Combo 2 unid.',
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/combo-cif.png',
 'Limpieza', true, NULL),

-- HIGIENE PERSONAL
('Jabón Dove x 90 gr',
 1900, 'Dove', true, 10, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/jabon-dove.png',
 'Higiene Personal', true, NULL),

('Juego de Toalla y Toallón CANNON color crema',
 27000, 'CANNON', true, 6, NULL,
 NULL,
 'Higiene Personal', true, NULL),

('Juego de Toalla y Toallón CANNON color blanco',
 27000, 'CANNON', true, 6, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/cannon-blanco.png',
 'Higiene Personal', true, NULL),

-- ARMONIZADORES
('Incienso Sathya Rose',
 1250, NULL, true, 10, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/incienso-sathya-rose.png',
 'Armonizadores', true, NULL),

('Incienso Super Hit',
 1250, NULL, true, 10, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/incienso-superhit.png',
 'Armonizadores', true, NULL),

('Incienso Vainilla',
 1250, NULL, true, 6, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/incienso-vainilla.png',
 'Armonizadores', true, NULL),

('Incienso Frankincense',
 1250, NULL, true, 6, NULL,
 NULL,
 'Armonizadores', true, NULL),

('Incienso Citronella',
 1250, NULL, true, 6, NULL,
 NULL,
 'Armonizadores', true, NULL),

('Incienso Padmini tubo x 20 varillas',
 1240, NULL, true, 6, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/incienso-padmini.png',
 'Armonizadores', true, NULL),

('Incienso Buda importado caja x 7 varillas',
 1240, NULL, true, 6, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/incienso-buda.png',
 'Armonizadores', true, NULL),

-- PASTAS SECAS
('Tallarines de trigo candeal de Cnel. Dorrego paq. x 500 gr',
 1260, NULL, true, NULL, NULL,
 NULL,
 'Pastas Secas', true, NULL),

-- VINOS
('Vino Juntos caja x 6 u. Amigo para Amigo',
 50000, 'Amigo para Amigo', true, NULL, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/vino-juntos.png',
 'Vinos', true, NULL),

('Vino Juntos por unidad Amigo para Amigo',
 8350, 'Amigo para Amigo', true, NULL, NULL,
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/vino-juntos.png',
 'Vinos', true, NULL),

('Combo Vino INTA Syrah + Vino INTA Reserva + Caballero de la Cepa',
 9000, NULL, true, 4, 'Combo de 3 unidades',
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/combo-vino-inta.png',
 'Vinos', true, NULL),

('Combo Vino Funky Malbec + Vino Parece pero no lo es + Vino Partridge Chardonnay',
 12000, NULL, true, 1, 'Combo de 3 unidades',
 'https://mripreurrceacpwyivmw.supabase.co/storage/v1/object/public/club-images/vitrina/combo-vino-funky.png',
 'Vinos', true, NULL);
