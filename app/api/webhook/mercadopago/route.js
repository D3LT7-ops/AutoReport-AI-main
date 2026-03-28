// ============================================================
// app/api/webhook/mercadopago/route.js
// ALTERADO:
//  - Adicionada validação de assinatura HMAC do Mercado Pago
//  - Sem validação, qualquer pessoa poderia ativar planos de graça
//  - Referência: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
// ============================================================

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Valida a assinatura HMAC enviada pelo Mercado Pago
// Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks#bookmark_validar_origem_das_notificações
function validarAssinaturaMP(request, body) {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) {
    // Se não tiver secret configurado, avisa mas não bloqueia
    // Assim o sistema funciona mesmo antes de configurar o secret
    console.warn('⚠️ MP_WEBHOOK_SECRET não configurado. Configure para validar webhooks.')
    return true
  }

  const xSignature  = request.headers.get('x-signature')
  const xRequestId  = request.headers.get('x-request-id')
  const dataId      = new URL(request.url).searchParams.get('data.id') || body?.data?.id

  if (!xSignature) {
    console.warn('Webhook sem x-signature — possível requisição não autorizada')
    return false
  }

  // Extrai ts e v1 do header x-signature
  const parts = {}
  xSignature.split(',').forEach(part => {
    const [key, val] = part.split('=')
    if (key && val) parts[key.trim()] = val.trim()
  })

  if (!parts.ts || !parts.v1) return false

  // Monta o manifesto para validação
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${parts.ts};`

  // Calcula HMAC SHA256
  const hmac      = createHmac('sha256', secret)
  const hashBytes = hmac.update(manifest).digest('hex')

  return hashBytes === parts.v1
}

const MP_TOKEN = process.env.MP_ACCESS_TOKEN

async function buscarPagamento(id) {
  if (!MP_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado')
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` }
  })
  return res.json()
}

async function buscarAssinatura(id) {
  if (!MP_TOKEN) throw new Error('MP_ACCESS_TOKEN não configurado')
  const res = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` }
  })
  return res.json()
}

function identificarPlano(referencia) {
  if (!referencia) return 'pro'
  if (referencia.includes('business')) return 'business'
  return 'pro'
}

async function ativarPlano(email, plano, assinaturaId = null) {
  const supabase = getAdminClient()
  const expira   = new Date()
  expira.setMonth(expira.getMonth() + 1)

  const { error } = await supabase
    .from('perfis')
    .update({
      plano,
      plano_ativo:   true,
      assinatura_id: assinaturaId,
      plano_expira:  expira.toISOString(),
    })
    .eq('email', email)

  if (error) console.error('Erro ao ativar plano:', error.message)
  else console.log(`✅ Plano ${plano} ativado para ${email}`)
}

async function cancelarPlano(email) {
  const supabase = getAdminClient()

  const { error } = await supabase
    .from('perfis')
    .update({
      plano:         'starter',
      plano_ativo:   false,
      assinatura_id: null,
      plano_expira:  null,
    })
    .eq('email', email)

  if (error) console.error('Erro ao cancelar plano:', error.message)
  else console.log(`❌ Plano cancelado para ${email}`)
}

export async function POST(request) {
  try {
    const body = await request.json()

    // NOVO: valida assinatura antes de processar
    if (!validarAssinaturaMP(request, body)) {
      console.error('Webhook com assinatura inválida rejeitado')
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
    }

    const { type, data } = body
    console.log('Webhook MP processado:', type, data?.id)

    if (!type || !data?.id) return NextResponse.json({ ok: true })

    if (type === 'payment') {
      const pagamento = await buscarPagamento(data.id)
      if (pagamento.status === 'approved') {
        const email = pagamento.payer?.email
        const plano = identificarPlano(pagamento.external_reference)
        if (email) await ativarPlano(email, plano)
      }
    }

    if (type === 'preapproval') {
      const assinatura = await buscarAssinatura(data.id)
      const email      = assinatura.payer_email || assinatura.external_reference
      const plano      = identificarPlano(assinatura.external_reference)

      if (assinatura.status === 'authorized')                               await ativarPlano(email, plano, data.id)
      if (assinatura.status === 'cancelled' || assinatura.status === 'paused') await cancelarPlano(email)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: true }) // sempre 200 para o MP não reenviar
  }
}

export async function GET() {
  return NextResponse.json({ status: 'webhook ativo' })
}