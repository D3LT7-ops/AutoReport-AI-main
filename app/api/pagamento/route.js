import { NextResponse } from 'next/server'
import { criarPreferencia } from '../../../lib/mercadopago'

// Planos disponíveis (espelhe os planos da sua landing/tela de planos)
const PLANOS = {
  starter: {
    id: 'starter',
    nome: 'Starter',
    descricao: 'Dashboard básico, até 50 vendas/mês, relatórios PDF',
    valor: 0,
    mpPlanoId: process.env.MP_PLANO_STARTER_ID || null,
  },
  pro: {
    id: 'pro',
    nome: 'Pro',
    descricao: 'Vendas ilimitadas, Excel, gráficos avançados',
    valor: 49.00,
    mpPlanoId: process.env.MP_PLANO_PRO_ID || null,
  },
  business: {
    id: 'business',
    nome: 'Business',
    descricao: 'Multi-empresas, API, relatórios personalizados',
    valor: 99.00,
    mpPlanoId: process.env.MP_PLANO_BUSINESS_ID || null,
  },
}

export async function POST(request) {
  try {
    const { planoId, email, nome } = await request.json()

    if (!planoId || !email) {
      return NextResponse.json(
        { error: 'planoId e email são obrigatórios' },
        { status: 400 }
      )
    }

    const plano = PLANOS[planoId]
    if (!plano) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
    }

    // Plano gratuito — não precisa de pagamento
    if (plano.valor === 0) {
      return NextResponse.json({ free: true, plano: plano.nome })
    }

    const preferencia = await criarPreferencia({ plano, email, nome: nome || email })

    if (preferencia.error) {
      console.error('MP Error:', preferencia)
      return NextResponse.json(
        { error: 'Erro ao criar preferência de pagamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: preferencia.id,
      // sandbox_init_point = ambiente de testes
      // init_point = produção real
      url: process.env.NODE_ENV === 'production'
        ? preferencia.init_point
        : preferencia.sandbox_init_point,
    })
  } catch (err) {
    console.error('Pagamento error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}