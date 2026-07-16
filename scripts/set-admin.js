/**
 * Asigna rol de administrador a un socio por su NSU.
 * Uso: node scripts/set-admin.js <NSU>
 * Ejemplo: node scripts/set-admin.js 56483
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://mripreurrceacpwyivmw.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_kNQ52CBFs7dXqGJ0Ayx85Q_QLjPTf9A'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function main() {
  const nsu = parseInt(process.argv[2], 10)
  if (!nsu || isNaN(nsu)) {
    console.error('Uso: node scripts/set-admin.js <NSU>')
    process.exit(1)
  }

  const { data, error } = await supabase
    .from('socios')
    .update({ is_admin: true })
    .eq('nsu', nsu)
    .select('nsu, nombre')
    .single()

  if (error || !data) {
    console.error('Error:', error?.message ?? 'Socio no encontrado')
    process.exit(1)
  }

  console.log(`✅ ${data.nombre} (NSU ${data.nsu}) ahora es administrador.`)
}

main().catch(e => { console.error(e); process.exit(1) })
