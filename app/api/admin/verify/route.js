// ============================================================
// app/api/admin/verify/route.js
// Valida o token de sessão admin verificando a assinatura HMAC.
// Chamado pelo AdminGuard a cada carregamento da área admin.
// ============================================================
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

export async function POST(request) {
  try {
    const { token } = await request.json()
    const secretKey = process.env.ADMIN_SECRET_KEY

    if (!secretKey || !token) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    // Token formato: timestamp.random.assinatura
    const partes = token.split('.')
    if (partes.length !== 3) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    const [ts, rand, sig] = partes
    const payload = `${ts}.${rand}`

    // Recalcula a assinatura esperada
    const sigEsperada = createHmac('sha256', secretKey).update(payload).digest('hex')

    // Compara de forma segura
    const sigBuffer      = Buffer.from(sig)
    const sigEsperadaBuf = Buffer.from(sigEsperada)

    const valido = sigBuffer.length === sigEsperadaBuf.length &&
      timingSafeEqual(sigBuffer, sigEsperadaBuf)

    if (!valido) return NextResponse.json({ ok: false }, { status: 401 })

    // Verifica expiração (8 horas)
    const oitoHoras = 8 * 60 * 60 * 1000
    if (Date.now() - parseInt(ts) > oitoHoras) {
      return NextResponse.json({ ok: false, expired: true }, { status: 401 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}