import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, apellido, tel, ciudad, ocasion, diseno } = body

    if (!nombre || !tel || !ciudad) {
      return Response.json({ error: 'Faltan datos' }, { status: 400 })
    }

    await supabase.from('vino_leads').insert({
      nombre,
      apellido: apellido || null,
      tel,
      ciudad,
      ocasion: ocasion || null,
      diseno: diseno || null,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false })
  }
}
