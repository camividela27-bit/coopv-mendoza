import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'noreply@coopvmendoza.com'

export async function notificarContribuidor(
  email: string,
  productos: { nombre: string; cantidad: number }[],
  socioNombre: string
) {
  const lineas = productos
    .map(p => `• ${p.nombre} × ${p.cantidad}`)
    .join('\n')

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a1a">
      <p style="font-size:13px;color:#666;margin-bottom:24px">COOPV Mendoza</p>
      <h2 style="margin:0 0 16px">📦 Nuevo pedido</h2>
      <p>Se realizó un pedido que incluye tu producto:</p>
      <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0;white-space:pre-line;font-size:15px">
${lineas}
      </div>
      <p style="color:#555">Socio: <strong>${socioNombre}</strong></p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
      <p style="font-size:12px;color:#999">Aviso automático · COOPV Mendoza</p>
    </div>
  `

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '📦 Nuevo pedido en COOPV Mendoza',
    html,
  })
}
