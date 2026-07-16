/**
 * Carga los productos de amigos en Supabase.
 * Uso: node scripts/import-products.js
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://mripreurrceacpwyivmw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_kNQ52CBFs7dXqGJ0Ayx85Q_QLjPTf9A'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const NOTA_BUDINES = 'Se deben encargar a principio de semana para entregar el fin de semana'
const NOTA_RESINA = 'Pedir ver modelo'
const NOTA_48HS = '48 horas antes de la entrega'

const productos = [
  // CC Provida Mza
  { nombre: 'Vino Malbec Juntos 2024 x 750 cc',        precio: 8350,  productor: 'CC Provida Mza',        notas: 'Precio unitario' },
  { nombre: 'Vino Malbec Juntos 2024, caja x 6',       precio: 50000, productor: 'CC Provida Mza',        notas: 'Caja x 6 unidades' },
  // Coope Cnel. Dorrego
  { nombre: 'Miel Cnel. Dorrego x 1 kg',               precio: 6300,  productor: 'Coope Cnel. Dorrego',   notas: 'Precio unitario' },
  // Daniela Peregrina
  { nombre: 'Crema de jarilla',                         precio: 12000, productor: 'Daniela Peregrina',     notas: null },
  { nombre: 'Crema de rosa mosqueta',                   precio: 10000, productor: 'Daniela Peregrina',     notas: null },
  { nombre: 'Crema de eucalipto, pino y tomillo',       precio: 7000,  productor: 'Daniela Peregrina',     notas: null },
  { nombre: 'Esencia de rosas',                         precio: 9000,  productor: 'Daniela Peregrina',     notas: null },
  // Alma y Daniel Dimaria
  { nombre: 'Budín naranja',                            precio: 5000,  productor: 'Alma y Daniel Dimaria', notas: NOTA_BUDINES },
  { nombre: 'Budín limón',                              precio: 5000,  productor: 'Alma y Daniel Dimaria', notas: NOTA_BUDINES },
  { nombre: 'Budín marmolado',                         precio: 5000,  productor: 'Alma y Daniel Dimaria', notas: NOTA_BUDINES },
  { nombre: 'Sorrentinos de jamón y muzzarella (docena)', precio: 8500, productor: 'Alma y Daniel Dimaria', notas: 'Disponibilidad freezados' },
  // Adriana Adad
  { nombre: 'Porta incienso',                           precio: 3500,  productor: 'Adriana Adad',          notas: NOTA_RESINA },
  { nombre: 'Llavero en resina personalizado',          precio: 4000,  productor: 'Adriana Adad',          notas: NOTA_RESINA },
  { nombre: 'Aros en resina',                           precio: 3000,  productor: 'Adriana Adad',          notas: NOTA_RESINA },
  { nombre: 'Colgantes en resina con cadenas',          precio: 5000,  productor: 'Adriana Adad',          notas: NOTA_RESINA },
  // Carolina de Brito
  { nombre: 'Tarta de acelga (mediana)',                precio: 12000, productor: 'Carolina de Brito',     notas: NOTA_48HS },
  { nombre: 'Tarta de pollo y puerros',                precio: 15000, productor: 'Carolina de Brito',     notas: NOTA_48HS },
  // Clary Gourmet
  { nombre: 'Prepizzas (2 unid)',                       precio: 4147,  productor: 'Clary Gourmet',         notas: NOTA_48HS },
  { nombre: 'Panqueques (12 unid)',                     precio: 4147,  productor: 'Clary Gourmet',         notas: NOTA_48HS },
  // Rosana Tabó
  { nombre: 'Placa Aromática',                          precio: 6000,  productor: 'Rosana Tabó',           notas: 'Disponible en stock' },
  { nombre: 'Atrapasoles Colgante',                     precio: 12000, productor: 'Rosana Tabó',           notas: 'Disponible en stock' },
  { nombre: 'Wax melts Aromas x 30gr',                 precio: 7500,  productor: 'Rosana Tabó',           notas: 'Disponible (elección de fragancia)' },
  { nombre: 'Puertero de pino con borla',              precio: 8000,  productor: 'Rosana Tabó',           notas: 'Disponible (elección diseño y color)' },
  // Susana Jofré
  { nombre: 'Shampoo Sólido Orgánico',                 precio: 10000, productor: 'Susana Jofré',          notas: 'Disponible en stock' },
  { nombre: 'Acondicionador Sólido Orgánico',          precio: 12000, productor: 'Susana Jofré',          notas: 'Disponible en stock' },
  { nombre: 'Cascadas de humo',                        precio: 15000, productor: 'Susana Jofré',          notas: 'Disponible en stock' },
  { nombre: 'Compoteras cerámica artesanal',           precio: 6000,  productor: 'Susana Jofré',          notas: 'Disponible en stock' },
  { nombre: 'Ensaladeras cerámica artesanal',          precio: 8000,  productor: 'Susana Jofré',          notas: 'Disponible en stock' },
]

async function main() {
  console.log(`Cargando ${productos.length} productos...`)

  const toInsert = productos.map(p => ({ ...p, disponible: true }))
  const { data, error } = await supabase.from('productos').insert(toInsert).select('id')

  if (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }

  console.log(`✅ ${data.length} productos cargados correctamente.`)
}

main().catch(e => { console.error(e); process.exit(1) })
