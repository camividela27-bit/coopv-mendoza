/**
 * Sube las imágenes de vitrina_club a Supabase Storage y genera los UPDATE SQL.
 * Ejecutar desde la carpeta webapp:
 *   node scripts/upload-vitrina-images.js
 *
 * Requiere Node 20+ para --env-file. Si tenés Node 18, exportar las variables antes:
 *   export $(cat .env.local | xargs) && node scripts/upload-vitrina-images.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs   = require('fs')
const path = require('path')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Faltan variables de entorno.')
  console.error('   Ejecutar con: node --env-file=.env.local scripts/upload-vitrina-images.js')
  process.exit(1)
}

const BUCKET  = 'club-images'
const IMG_DIR = path.resolve(__dirname, '../../content/Productos -Imagenes')

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const MAP = [
  { file: '091FE3E8-511E-48AF-A97F-A4CAA3C08EE3.PNG', name: 'vitrina/azucar-ledesma.png',        nombre: 'Azucar Ledesma x 1 kg' },
  { file: '0BC7CA3D-8B6E-4E4E-A805-B9EDEB34184C.PNG', name: 'vitrina/miel-dorrego.png',           nombre: 'Miel pote x 1 kg De Cnel. Dorrego' },
  { file: '15D9D944-3C1E-417D-9AA1-171E538CBBA9.PNG', name: 'vitrina/combo-cif.png',              nombre: 'Combo CIF limpiapisos repuesto + CIF Bioactive antigrasa' },
  { file: '43A3832A-DE2F-4168-9C67-2B23DF6AC821.PNG', name: 'vitrina/incienso-vainilla.png',      nombre: 'Incienso Vainilla' },
  { file: '44CF8E34-EB8A-4981-8048-FC83DC16A226.PNG', name: 'vitrina/incienso-sathya-rose.png',   nombre: 'Incienso Sathya Rose' },
  { file: '49F3B757-0FCE-42E2-8445-9C7652DDED5B.PNG', name: 'vitrina/aceite-girasol-natura.png',  nombre: 'Aceite girasol Natura x 900 ml' },
  { file: '4B34E3AE-1C13-4600-88C5-DDE0E80041A5.PNG', name: 'vitrina/incienso-buda.png',          nombre: 'Incienso Buda importado caja x 7 varillas' },
  { file: '607F2B8F-61A5-41CB-856F-731329E58328.PNG', name: 'vitrina/papel-aro-200.png',          nombre: 'Papel Aro family 1 x 200 paños' },
  { file: '7C6C2988-9A89-42DA-9DAB-A13F8C210A07.PNG', name: 'vitrina/aceitunas-griegas.png',      nombre: 'Aceitunas griegas Amigo para Amigo cosecha 2026' },
  { file: '7D97FEFE-7BC3-4EF7-8503-C69B7DD3D1BD.PNG', name: 'vitrina/combo-vino-inta.png',        nombre: 'Combo Vino INTA Syrah + Vino INTA Reserva + Caballero de la Cepa' },
  { file: '83017E8B-6713-4D0C-B166-CD3D5B53C51F.PNG', name: 'vitrina/jabon-dove.png',             nombre: 'Jabón Dove x 90 gr' },
  { file: '8D65074A-B112-4003-B347-EB5883A84191.PNG', name: 'vitrina/incienso-padmini.png',       nombre: 'Incienso Padmini tubo x 20 varillas' },
  { file: '9A368ECB-6D50-4CE4-95CD-CD69BC280A5B.PNG', name: 'vitrina/papel-cocina-sussex.png',    nombre: 'Papel cocina Sussex 3x50' },
  { file: 'A47C0A13-F7CB-4B75-8A9E-C7C6B3D37E61.PNG', name: 'vitrina/papel-higienico.png',        nombre: 'Rollo papel higiénico Higienol 4 x 30 DH' },
  { file: 'A527F022-1EE2-40CF-B0E7-CC7F291D1654.PNG', name: 'vitrina/aceite-oliva-oscar.png',     nombre: 'Aceite oliva D. Oscar x 1 lt' },
  { file: 'A77D9A8D-3EB6-440D-AA67-74B37540787C.PNG', name: 'vitrina/ketchup-heinz.png',          nombre: 'Ketchup Heinz x 190 gr' },
  { file: 'BD522E74-DA0B-4D5E-BCDA-71EAF2D096C3.PNG', name: 'vitrina/galletas-hojalmar.png',      nombre: 'Galletas Hojalmar Veggie Larguitas x 150 gr' },
  { file: 'C16F1BD6-CFDB-4765-8546-65AA360A64DA.PNG', name: 'vitrina/vino-juntos.png',            nombre: 'Vino Juntos' },
  { file: 'C264166F-0A5D-4CFD-B9D5-B45BA7887A4C.PNG', name: 'vitrina/combo-aceitunas.png',        nombre: 'Combo Pasta aceitunas' },
  { file: 'C7263920-0BAD-4641-9DCA-BBC9D0B4B616.PNG', name: 'vitrina/incienso-superhit.png',      nombre: 'Incienso Super Hit' },
  { file: 'D90880A5-00CE-4385-857A-DAE26F5F7E00.PNG', name: 'vitrina/combo-vino-funky.png',       nombre: 'Combo Vino Funky Malbec' },
  { file: 'DDA7EC18-D961-4A15-9C8D-B8A147F61857.PNG', name: 'vitrina/tallarines.png',             nombre: 'Tallarines de trigo candeal' },
  { file: 'DECD35D3-5670-44D7-B949-717067D13F83.PNG', name: 'vitrina/cannon-blanco.png',          nombre: 'Juego de Toalla y Toallón CANNON color blanco' },
  { file: 'E4B8283A-68FF-4E7E-8B7D-D8EE17B3E877.PNG', name: 'vitrina/combo-jengibre.png',         nombre: 'Combo Jengibre Mardegan' },
]

async function main() {
  console.log(`📁  Buscando imágenes en: ${IMG_DIR}\n`)
  const updates = []

  for (const item of MAP) {
    const filePath = path.join(IMG_DIR, item.file)
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠   No encontrado: ${item.file}`)
      continue
    }

    const buffer = fs.readFileSync(filePath)

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(item.name, buffer, { contentType: 'image/png', upsert: true })

    if (error) {
      console.error(`✗   ${item.name}: ${error.message}`)
      continue
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${item.name}`
    console.log(`✓   ${item.name}`)
    updates.push({ nombre: item.nombre, url })
  }

  console.log('\n\n-- ============================================')
  console.log('-- Pegar esto en Supabase Dashboard → SQL Editor')
  console.log('-- ============================================\n')
  for (const u of updates) {
    console.log(`UPDATE vitrina_club SET imagen_url = '${u.url}'\n  WHERE nombre ILIKE '%${u.nombre.slice(0,25)}%';\n`)
  }
  // Vino Juntos unitario usa la misma imagen
  const juntos = updates.find(u => u.nombre === 'Vino Juntos')
  if (juntos) {
    console.log(`UPDATE vitrina_club SET imagen_url = '${juntos.url}'\n  WHERE nombre ILIKE '%Vino Juntos por unidad%';\n`)
  }
  console.log('-- ============================================')
}

main().catch(console.error)
