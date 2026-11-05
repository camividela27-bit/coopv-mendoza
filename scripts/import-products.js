const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://mripreurrceacpwyivmw.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('Falta SUPABASE_SERVICE_ROLE_KEY. Ejecutá:')
  console.error('SUPABASE_SERVICE_ROLE_KEY=tu_clave node scripts/import-products.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const products = [
  { nombre: 'Vino Malbec Juntos 2024 x 750 cc', precio: 8350, productor: 'CC Provida Mza', stock: null, detalles: null, notas: 'precio unitario', contribuidor_email: 'plantinpot@gmail.com' },
  { nombre: 'Vino Malbec Juntos 2024, caja x 6', precio: 50000, productor: 'CC Provida Mza', stock: null, detalles: null, notas: 'caja x 6 unidades', contribuidor_email: 'plantinpot@gmail.com' },
  { nombre: 'Miel Cnel. Dorrego x 1 kg', precio: 6300, productor: 'Coope Cnel. Dorrego', stock: 15, detalles: null, notas: null, contribuidor_email: 'plantinpot@gmail.com' },
  { nombre: 'Aceitunas Sajadas frasco', precio: 3500, productor: 'COOPV Mendoza', stock: 10, detalles: '330 gr', notas: 'precio unitario', contribuidor_email: 'plantinpot@gmail.com' },
  { nombre: 'Aceitunas Griegas frasco', precio: 3500, productor: 'COOPV Mendoza', stock: 10, detalles: '330 gr', notas: 'precio unitario', contribuidor_email: 'plantinpot@gmail.com' },
  { nombre: 'Crema de jarilla', precio: 12000, productor: 'Daniela Peregrina', stock: 10, detalles: null, notas: null, contribuidor_email: 'danielamperegrina@gmail.com' },
  { nombre: 'Crema de rosa mosqueta', precio: 10000, productor: 'Daniela Peregrina', stock: 10, detalles: null, notas: null, contribuidor_email: 'danielamperegrina@gmail.com' },
  { nombre: 'Crema de eucalipto, pino y tomillo', precio: 7000, productor: 'Daniela Peregrina', stock: 10, detalles: null, notas: null, contribuidor_email: 'danielamperegrina@gmail.com' },
  { nombre: 'Esencia de rosas', precio: 9000, productor: 'Daniela Peregrina', stock: 10, detalles: null, notas: null, contribuidor_email: 'danielamperegrina@gmail.com' },
  { nombre: 'Budín naranja', precio: 5000, productor: 'Alma y Daniel Dimaria', stock: null, detalles: '500 gramos', notas: 'Encargar a principio de semana, entrega el fin de semana', contribuidor_email: 'daniel.dimaria@unum.com.ar' },
  { nombre: 'Budín limón', precio: 5000, productor: 'Alma y Daniel Dimaria', stock: 0, detalles: '500 gramos', notas: null, contribuidor_email: 'daniel.dimaria@unum.com.ar' },
  { nombre: 'Budín marmolado', precio: 5000, productor: 'Alma y Daniel Dimaria', stock: null, detalles: '500 gramos', notas: 'Encargar a principio de semana, entrega el fin de semana', contribuidor_email: 'daniel.dimaria@unum.com.ar' },
  { nombre: 'Sorrentinos de jamón y muzzarella (docena)', precio: 8500, productor: 'Alma y Daniel Dimaria', stock: 10, detalles: 'Docena', notas: 'Disponibilidad freezados', contribuidor_email: 'daniel.dimaria@unum.com.ar' },
  { nombre: 'Sorrentinos de calabaza y muzzarella (docena)', precio: 8000, productor: 'Alma y Daniel Dimaria', stock: 0, detalles: 'Docena', notas: 'También serán freezados', contribuidor_email: 'daniel.dimaria@unum.com.ar' },
  { nombre: 'Porta incienso', precio: 3500, productor: 'Adriana Adad', stock: 5, detalles: null, notas: 'Pedir ver modelo 48hs antes', contribuidor_email: 'adrianaadad22@gmail.com' },
  { nombre: 'Llavero en resina personalizado', precio: 4000, productor: 'Adriana Adad', stock: null, detalles: null, notas: 'Pedir ver modelo 48hs antes', contribuidor_email: 'adrianaadad22@gmail.com' },
  { nombre: 'Aros en resina', precio: 3000, productor: 'Adriana Adad', stock: null, detalles: null, notas: 'Pedir ver modelo 48hs antes', contribuidor_email: 'adrianaadad22@gmail.com' },
  { nombre: 'Colgantes en resina con cadenas', precio: 5000, productor: 'Adriana Adad', stock: null, detalles: null, notas: 'Pedir ver modelo 48hs antes', contribuidor_email: 'adrianaadad22@gmail.com' },
  { nombre: 'Souvenirs 5 cm (x 10)', precio: 20000, productor: 'Adriana Adad', stock: null, detalles: null, notas: 'Pedir modelo 10 días antes', contribuidor_email: 'adrianaadad22@gmail.com' },
  { nombre: 'Souvenirs 3 cm (x 10)', precio: 18000, productor: 'Adriana Adad', stock: null, detalles: null, notas: 'Pedir modelo 10 días antes', contribuidor_email: 'adrianaadad22@gmail.com' },
  { nombre: 'Tarta de acelga (mediana)', precio: 12000, productor: 'Carolina de Brito', stock: null, detalles: '950 grs', notas: '48 horas antes de la entrega', contribuidor_email: 'caromza1514@hotmail.com' },
  { nombre: 'Tarta de pollo y puerros (mediana)', precio: 15000, productor: 'Carolina de Brito', stock: null, detalles: '950 grs', notas: '48 horas antes de la entrega', contribuidor_email: 'caromza1514@hotmail.com' },
  { nombre: 'Tarta de cebolla y queso (mediana)', precio: 12000, productor: 'Carolina de Brito', stock: null, detalles: '950 grs', notas: '48 horas antes de la entrega', contribuidor_email: 'caromza1514@hotmail.com' },
  { nombre: 'Tarta de choclo (mediana)', precio: 12000, productor: 'Carolina de Brito', stock: null, detalles: '950 grs', notas: '48 horas antes de la entrega', contribuidor_email: 'caromza1514@hotmail.com' },
  { nombre: 'Tarta de zapallitos (mediana)', precio: 12000, productor: 'Carolina de Brito', stock: null, detalles: '950 grs', notas: '48 horas antes de la entrega', contribuidor_email: 'caromza1514@hotmail.com' },
  { nombre: 'Tarta de jamón y queso (mediana)', precio: 15000, productor: 'Carolina de Brito', stock: null, detalles: '950 grs', notas: '48 horas antes de la entrega', contribuidor_email: 'caromza1514@hotmail.com' },
  { nombre: 'Pastel de papas', precio: 16000, productor: 'Carolina de Brito', stock: null, detalles: '1.200 grs', notas: '48 horas antes de la entrega', contribuidor_email: 'caromza1514@hotmail.com' },
  { nombre: 'Prepizzas (2 unid)', precio: 4147, productor: 'Julio Niveyro', stock: null, detalles: null, notas: '48 horas antes de la entrega', contribuidor_email: 'Cesar@provida.org.br' },
  { nombre: 'Panqueques (12 unid)', precio: 4147, productor: 'Julio Niveyro', stock: null, detalles: null, notas: '48 horas antes de la entrega', contribuidor_email: 'Cesar@provida.org.br' },
  { nombre: 'Pasta frola individual', precio: 2000, productor: 'Clara Niveyro', stock: null, detalles: '1 unid', notas: '48 horas antes de la entrega', contribuidor_email: 'Sincopado32@gmail.com' },
  { nombre: 'Alfajores de maicena (6 unid)', precio: 3600, productor: 'Clara Niveyro', stock: null, detalles: '6 unid', notas: '48 horas antes de la entrega', contribuidor_email: 'Sincopado32@gmail.com' },
  { nombre: 'Placa Aromática', precio: 6000, productor: 'Rosana Tabó', stock: 10, detalles: null, notas: 'Disponible en stock', contribuidor_email: 'valeriarosanatabo@gmail.com' },
  { nombre: 'Atrapasoles Colgante', precio: 12000, productor: 'Rosana Tabó', stock: 10, detalles: null, notas: 'Disponible en stock', contribuidor_email: 'valeriarosanatabo@gmail.com' },
  { nombre: 'Wax melts Aromas x 20gr', precio: 6000, productor: 'Rosana Tabó', stock: 30, detalles: 'Elección de aromas', notas: 'Disponible, elección de fragancia', contribuidor_email: 'valeriarosanatabo@gmail.com' },
  { nombre: 'Puentero de pino con borla', precio: 8000, productor: 'Rosana Tabó', stock: null, detalles: null, notas: 'Disponible, elección de diseño y color', contribuidor_email: 'valeriarosanatabo@gmail.com' },
  { nombre: 'Shampoo Sólido Orgánico', precio: 10000, productor: 'Susana Jofré', stock: null, detalles: null, notas: 'Disponible en stock', contribuidor_email: 'Susy.jofre@hotmail.es' },
  { nombre: 'Acondicionador Sólido Orgánico', precio: 12000, productor: 'Susana Jofré', stock: null, detalles: null, notas: 'Disponible en stock', contribuidor_email: 'Susy.jofre@hotmail.es' },
  { nombre: 'Cascadas de humo', precio: 15000, productor: 'Susana Jofré', stock: null, detalles: null, notas: 'Disponible en stock', contribuidor_email: 'Susy.jofre@hotmail.es' },
  { nombre: 'Compoteras cerámica artesanal', precio: 6000, productor: 'Susana Jofré', stock: null, detalles: null, notas: 'Disponible en stock', contribuidor_email: 'Susy.jofre@hotmail.es' },
  { nombre: 'Ensaladeras cerámica artesanal', precio: 8000, productor: 'Susana Jofré', stock: null, detalles: null, notas: 'Disponible en stock', contribuidor_email: 'Susy.jofre@hotmail.es' },
  { nombre: 'Almendras Acarameladas premium', precio: 2500, productor: 'Gabriela Elias', stock: null, detalles: '100 gs', notas: 'precio unitario', contribuidor_email: 'gabyelias_69@yahoo.com.ar' },
  { nombre: 'Almendras con choc. Semiamargo/leche', precio: 6000, productor: 'Gabriela Elias', stock: null, detalles: '100 gs', notas: 'precio unitario', contribuidor_email: 'gabyelias_69@yahoo.com.ar' },
  { nombre: 'Arándanos con choc. semiamargo', precio: 5000, productor: 'Gabriela Elias', stock: null, detalles: '100 gs', notas: 'precio unitario', contribuidor_email: 'gabyelias_69@yahoo.com.ar' },
  { nombre: 'Pasas de Uva con choc. al Ron', precio: 4000, productor: 'Gabriela Elias', stock: null, detalles: '100 gs', notas: 'precio unitario', contribuidor_email: 'gabyelias_69@yahoo.com.ar' },
  { nombre: 'Maníes con choc. leche/semiamargo', precio: 3500, productor: 'Gabriela Elias', stock: null, detalles: '100 gs', notas: 'precio unitario', contribuidor_email: 'gabyelias_69@yahoo.com.ar' },
  { nombre: 'Cereales crocantes choc. Blanco/leche', precio: 4500, productor: 'Gabriela Elias', stock: null, detalles: '100 gs', notas: 'precio unitario', contribuidor_email: 'gabyelias_69@yahoo.com.ar' },
  { nombre: 'Maíz Frito con choc. Leche', precio: 4000, productor: 'Gabriela Elias', stock: null, detalles: '100 gs', notas: 'precio unitario', contribuidor_email: 'gabyelias_69@yahoo.com.ar' },
  { nombre: 'Rocklets', precio: 2000, productor: 'Gabriela Elias', stock: null, detalles: '100 gs', notas: 'precio unitario', contribuidor_email: 'gabyelias_69@yahoo.com.ar' },
  { nombre: 'Difusor varillas/varios aromas', precio: 11700, productor: 'Marta Pecchini', stock: null, detalles: '100 cc', notas: '48 horas antes de la entrega', contribuidor_email: 'martapecchini16@gmail.com' },
  { nombre: 'Repelente para orina perros y gatos', precio: 18900, productor: 'Marta Pecchini', stock: null, detalles: '500 cc', notas: '48 horas antes de la entrega', contribuidor_email: 'martapecchini16@gmail.com' },
  { nombre: 'Home spray / perfume telas (250 cc)', precio: 10700, productor: 'Marta Pecchini', stock: null, detalles: '250 cc', notas: '48 horas antes, varios aromas', contribuidor_email: 'martapecchini16@gmail.com' },
  { nombre: 'Home spray / perfume telas (500 cc)', precio: 15700, productor: 'Marta Pecchini', stock: null, detalles: '500 cc', notas: '48 horas antes, varios aromas', contribuidor_email: 'martapecchini16@gmail.com' },
]

async function main() {
  console.log('Limpiando datos anteriores...')

  const { error: e1 } = await supabase.from('pedido_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (e1) { console.error('Error borrando pedido_items:', e1.message); process.exit(1) }

  const { error: e2 } = await supabase.from('pedidos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (e2) { console.error('Error borrando pedidos:', e2.message); process.exit(1) }

  const { error: e3 } = await supabase.from('productos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (e3) { console.error('Error borrando productos:', e3.message); process.exit(1) }

  console.log('Insertando 52 productos...')

  const toInsert = products.map(p => ({ ...p, disponible: true }))
  const { error: e4 } = await supabase.from('productos').insert(toInsert)
  if (e4) { console.error('Error insertando productos:', e4.message); process.exit(1) }

  console.log(`\n✅ Listo. ${products.length} productos cargados correctamente.`)
}

main().catch(e => { console.error('Error:', e); process.exit(1) })
