// Mercado Pago SDK Integration
// Docs: https://www.mercadopago.com.br/developers/pt/docs

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
const MP_BASE_URL = 'https://api.mercadopago.com'

const headers = () => ({
  'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'X-Idempotency-Key': `autoreport-${Date.now()}`,
})

// ── PLANOS ──────────────────────────────────────────────
// Cria um plano de assinatura no Mercado Pago
export async function criarPlano({ nome, valor, frequencia = 'months', intervalo = 1 }) {
  const res = await fetch(`${MP_BASE_URL}/preapproval_plan`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      reason: nome,
      auto_recurring: {
        frequency: intervalo,
        frequency_type: frequencia, // 'months' ou 'days'
        transaction_amount: valor,
        currency_id: 'BRL',
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
    }),
  })
  return res.json()
}

// ── ASSINATURAS ─────────────────────────────────────────
// Cria uma assinatura para um usuário
export async function criarAssinatura({ planoId, email, nome, cpf }) {
  const res = await fetch(`${MP_BASE_URL}/preapproval`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      preapproval_plan_id: planoId,
      reason: 'AutoReport AI — Assinatura',
      payer_email: email,
      card_token_id: null, // será preenchido pelo checkout do MP
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        currency_id: 'BRL',
      },
      back_url: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
      external_reference: email,
    }),
  })
  return res.json()
}

// Busca uma assinatura pelo ID
export async function buscarAssinatura(id) {
  const res = await fetch(`${MP_BASE_URL}/preapproval/${id}`, {
    headers: headers(),
  })
  return res.json()
}

// Cancela uma assinatura
export async function cancelarAssinatura(id) {
  const res = await fetch(`${MP_BASE_URL}/preapproval/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ status: 'cancelled' }),
  })
  return res.json()
}

// ── CHECKOUT PREFERENCE ─────────────────────────────────
// Cria um link de pagamento via Checkout Pro (redirect)
export async function criarPreferencia({ plano, email, nome }) {
  const res = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      items: [{
        id: plano.id,
        title: `AutoReport AI — Plano ${plano.nome}`,
        description: plano.descricao,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: plano.valor,
      }],
      payer: { email, name: nome },
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/cancelado`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento/sucesso`,
      },
      auto_return: 'approved',
      external_reference: email,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago`,
      // Para assinatura recorrente via Checkout Pro:
      subscription_data: {
        preapproval_plan_id: plano.mpPlanoId || null,
      },
    }),
  })
  return res.json()
}

// ── WEBHOOK ─────────────────────────────────────────────
// Verifica e processa eventos do webhook
export async function processarWebhook(tipo, id) {
  if (tipo === 'payment') {
    const res = await fetch(`${MP_BASE_URL}/v1/payments/${id}`, {
      headers: headers(),
    })
    return res.json()
  }
  if (tipo === 'preapproval') {
    return buscarAssinatura(id)
  }
  return null
}