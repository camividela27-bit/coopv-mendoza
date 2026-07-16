/**
 * Importa socios desde COOPV-Socios-Completo.xlsx a Supabase.
 * Uso: node scripts/import-members.js
 *
 * Requiere: npm install --save-dev xlsx
 * (ejecutar solo una vez, desde la carpeta webapp/)
 */

const path = require('path')
const XLSX = require('xlsx')
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://mripreurrceacpwyivmw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_kNQ52CBFs7dXqGJ0Ayx85Q_QLjPTf9A'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const EXCEL_PATH = path.join(__dirname, '../../assets/COOPV-Socios-Completo.xlsx')

async function main() {
  console.log('Leyendo Excel:', EXCEL_PATH)

  let workbook
  try {
    workbook = XLSX.readFile(EXCEL_PATH)
  } catch (e) {
    console.error('No se pudo leer el archivo Excel:', e.message)
    process.exit(1)
  }

  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

  const members = []
  let currentTipo = 'mendoza'

  for (const row of rows) {
    const [nsuRaw, nombreRaw, cursoRaw, , tipoRaw] = row

    // Detectar encabezados de sección (ej: "San Juan", "Visitantes")
    if (typeof nombreRaw === 'string' && !nsuRaw) {
      const lower = nombreRaw.toLowerCase()
      if (lower.includes('san juan') || lower.includes('visita')) {
        currentTipo = 'visitante'
      }
      continue
    }

    const nsu = typeof nsuRaw === 'number' ? Math.floor(nsuRaw) : parseInt(String(nsuRaw || ''), 10)
    if (!nsu || isNaN(nsu) || nsu <= 0) continue

    const nombre = typeof nombreRaw === 'string' ? nombreRaw.trim() : null
    if (!nombre) continue

    const tipoExplicito = typeof tipoRaw === 'string' ? tipoRaw.toLowerCase() : null
    const tipo = tipoExplicito?.includes('visita') ? 'visitante' : currentTipo
    const curso = typeof cursoRaw === 'string' ? cursoRaw.trim() : null

    members.push({ nsu, nombre, tipo, curso, is_admin: false, activo: true })
  }

  if (members.length === 0) {
    console.error('No se encontraron socios en el Excel. Verificá la estructura del archivo.')
    process.exit(1)
  }

  console.log(`Socios encontrados: ${members.length}`)
  console.log(`  Mendoza:   ${members.filter(m => m.tipo === 'mendoza').length}`)
  console.log(`  Visitante: ${members.filter(m => m.tipo === 'visitante').length}`)
  console.log('\nInsertando en Supabase...')

  let inserted = 0
  let skipped = 0
  for (const member of members) {
    const { error } = await supabase
      .from('socios')
      .upsert(member, { onConflict: 'nsu', ignoreDuplicates: true })

    if (error) {
      console.error(`\nError NSU ${member.nsu}:`, error.message)
    } else {
      inserted++
      process.stdout.write(`\r  ${inserted}/${members.length} socios importados...`)
    }
  }

  console.log('\n\n✅ Importación completa.')
  console.log('Los socios ingresan con solo su NSU.')
}

main().catch(e => {
  console.error('Error inesperado:', e)
  process.exit(1)
})
