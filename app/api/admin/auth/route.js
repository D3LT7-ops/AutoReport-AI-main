// ============================================================
// app/api/admin/auth/route.js
// Valida a chave secreta do admin e retorna um token
// de sessão temporário (válido por 8 horas).
// A chave real fica APENAS na variável de ambiente ADMIN_SECRET_KEY
// nunca no código.
// ============================================================
import { NextResponse } from 'next/server'
import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

export async function POST(request) {
  try {
    const { chave } = await request.json()

    const secretKey = process.env.ADMIN_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'ADMIN_SECRET_KEY não configurado' }, { status: 500 })
    }

    // Comparação segura — evita timing attacks
    const chaveBuffer  = Buffer.from(chave || '')
    const secretBuffer = Buffer.from(secretKey)

    // Garante buffers do mesmo tamanho para timingSafeEqual
    const match = chaveBuffer.length === secretBuffer.length &&
      timingSafeEqual(chaveBuffer, secretBuffer)

    if (!match) {
      // Aguarda 1s para dificultar brute force
      await new Promise(r => setTimeout(r, 1000))
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    // Gera token de sessão assinado com HMAC
    // Formato: timestamp.random.assinatura
    const ts     = Date.now()
    const rand   = randomBytes(16).toString('hex')
    const payload = `${ts}.${rand}`
    const sig    = createHmac('sha256', secretKey).update(payload).digest('hex')
    const token  = `${payload}.${sig}`

    return NextResponse.json({ ok: true, token })
  } catch (err) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}