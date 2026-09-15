/**
 * Sube las imágenes de vitrina_club a Supabase Storage y actualiza imagen_url.
 * Ejecutar desde la carpeta webapp:  node scripts/upload-vitrina-images.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  console.error('Ejecutar con: node --env-file=.env.local scripts/upload-vitrina-images.js')
  process.exit(1)
}
const BUCKET        = 'club-images'
const IMG_DIR       = path.resolve(__dirname, '../../content/Productos -Imagenes')

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// filename → { storageName, productNombre }
const MAP = [
  { file: '091FE3E8-511E-48AF-A97F-A4CAA3C08EE3.PNG', name: 'azucar-ledesma.png',       nombre: 'Azucar Ledesma x 1 kg' },
  { file: '0BC7CA3D-8B6E-4E4E-A805-B9EDEB34184C.PNG', name: 'miel-dorrego.png',          nombre: 'Miel pote x 1 kg De Cnel. Dorrego' },
  { file: '15D9D944-3C1E-417D-9AA1-171E538CBBA9.PNG', name: 'combo-cif.png',             nombre: 'Combo CIF limpiapisos repuesto + CIF Bioactive antigrasa' },
  { file: '43A3832A-DE2F-4168-9C67-2B23DF6AC821.PNG', name: 'incienso-vainilla.png',     nombre: 'Incienso Vainilla' },
  { file: '44CF8E34-EB8A-4981-8048-FC83DC16A226.PNG', name: 'incienso-sathya-rose.png',  nombre: 'Incienso Sathya Rose' },
  { file: '49F3B757-0FCE-42E2-8445-9C7652DDED5B.PNG', name: 'aceite-girasol-natura.png', nombre: 'Aceite girasol Natura x 900 ml' },
  { file: '4B34E3AE-1C13-4600-88C5-DDE0E80041A5.PNG', name: 'incienso-buda.png',         nombre: 'Incienso Buda importado caja x 7 varillas' },
  { file: '607F2B8F-61A5-41CB-856F-731329E58328.PNG', name: 'papel-aro-200.png',         nombre: 'Papel Aro family 1 x 200 paños' },
  { file: '7C6C2988-9A89-42DA-9DAB-A13F8C210A07.PNG', name: 'aceitunas-griegas.png',     nombre: 'Aceitunas griegas Amigo para Amigo cosecha 2026' },
  { file: '7D97FEFE-7BC3-4EF7-8503-C69B7DD3D1BD.PNG', name: 'combo-vino-inta.png',       nombre: 'Combo Vino INTA Syrah + Vino INTA Reserva + Caballero de la Cepa' },
  { file: '83017E8B-6713-4D0C-B166-CD3D5B53C51F.PNG', name: 'jabon-dove.png',            nombre: 'Jabón Dove x 90 gr' },
  { file: '8D65074A-B112-4003-B347-EB5883A84191.PNG', name: 'incienso-padmini.png',      nombre: 'Incienso Padmini tubo x 20 varillas' },
  { file: '9A368ECB-6D50-4CE4-95CD-CD69BC280A5B.PNG', name: 'papel-cocina-sussex.png',   nombre: 'Papel cocina Sussex 3x50' },
  { file: 'A47C0A13-F7CB-4B75-8A9E-C7C6B3D37E61.PNG', name: 'papel-higienico-higienol.png', nombre: 'Rollo papel higiénico Higienol 4 x 30 DH' },
  { file: 'A527F022-1EE2-40CF-B0E7-CC7F291D1654.PNG', name: 'aceite-oliva-oscar.png',    nombre: 'Aceite oliva D. Oscar x 1 lt' },
  { file: 'A77D9A8D-3EB6-440D-AA67-74B37540787C.PNG', name: 'ketchup-heinz.png',         nombre: 'Ketchup Heinz x 190 gr' },
  { file: 'BD522E74-DA0B-4D5E-BCDA-71EAF2D096C3.PNG', name: 'galletas-hojalmar.png',     nombre: 'Galletas Hojalmar Veggie Larguitas x 150 gr' },
  { file: 'C16F1BD6-CFDB-4765-8546-65AA360A64DA.PNG', name: 'vino-juntos.png',           nombre: 'Vino Juntos caja x 6 u. Amigo para Amigo' },
  { file: 'C264166F-0A5D-4CFD-B9D5-B45BA7887A4C.PNG', name: 'combo-aceitunas.png',       nombre: 'Combo Pasta aceitunas DP x 280 gr + Aceitunas verdes descarozadas DP x 140 gr + Aceitunas Salmuera DP x 160 gr' },
  { file: 'C7263920-0BAD-4641-9DCA-BBC9D0B4B616.PNG', name: 'incienso-superhit.png',     nombre: 'Incienso Super Hit' },
  { file: 'D7A44F26-6AE9-490A-B360-F1C1DACA63CA.PNG', name: 'cif-limpiapisos.png',       nombre: null }, // segunda imagen CIF (no se usa como nombre propio)
  { file: 'D90880A5-00CE-4385-857A-DAE26F5F7E00.PNG', name: 'combo-vino-funky.png',      nombre: 'Combo Vino Funky Malbec + Vino Parece pero no lo es + Vino Partridge Chardonnay' },
  { file: 'DDA7EC18-D961-4A15-9C8D-B8A147F61857.PNG', name: 'tallarines.png',            nombre: 'Tallarines de trigo candeal de Cnel. Dorrego paq. x 500 gr' },
  { file: 'DECD35D3-5670-44D7-B949-717067D13F83.PNG', name: 'cannon-blanco.png',         nombre: 'Juego de Toalla y Toallón CANNON color blanco' },
  { file: 'E4B8283A-68FF-4E7E-8B7D-D8EE17B3E877.PNG', name: 'combo-jengibre.png',        nombre: 'Combo Jengibre Mardegan fco. x 85 gr + Curry fco. x 75 gr + Canela fco. x 65 gr' },
]

async function main() {
  let uploaded = 0
  const updates = []

  for (const item of MAP) {
    const filePath = path.join(IMG_DIR, item.file)
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠  Archivo no encontrado: ${item.file}`)
      continue
    }

    const buffer = fs.readFileSync(filePath)
    const storagePath = `vitrina/${item.name}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (error) {
      console.error(`✗  ${item.name}: ${error.message}`)
      continue
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
    console.log(`✓  ${item.name}`)
    uploaded++

    if (item.nombre) {
      updates.push({ nombre: item.nombre, url: publicUrl })
    }
  }

  // También asignar misma imagen de Vino Juntos al producto unitario
  const juntos = updates.find(u => u.nombre === 'Vino Juntos caja x 6 u. Amigo para Amigo')
  if (juntos) {
    updates.push({ nombre: 'Vino Juntos por unidad Amigo para Amigo', url: juntos.url })
  }

  console.log(`\n✅  ${uploaded} imágenes subidas.\n`)
  console.log('-- SQL para pegar en Supabase Dashboard:\n')
  for (const u of updates) {
    const safe = u.nombre.replace(/'/g, "''")
    console.log(`UPDATE vitrina_club SET imagen_url = '${u.url}' WHERE nombre ILIKE '%${safe.slice(0, 30)}%';`)
  }
}

main().catch(console.error)
