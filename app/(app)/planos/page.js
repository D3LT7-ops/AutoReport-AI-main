'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/sidebar/Navbar'
import { getSession } from '../../../lib/auth'
import {
  CheckCircle, Zap, Crown, Building2,
  Loader2, AlertCircle, ExternalLink
} from 'lucide-react'

const PLANOS = [
  {
    id: 'starter',
    nome: 'Starter',
    icon: Zap,
    iconColor: '#4350e8',
    iconBg: '#f0f4ff',
    preco: 0,
    precoLabel: 'Grátis',
    descLabel: 'Para sempre',
    descricao: 'Ideal para começar e testar a plataforma.',
    itens: [
      'Dashboard básico',
      'Até 50 vendas por mês',
      'Relatórios em PDF',
      'Suporte por e-mail',
    ],
    highlight: false,
  },
  {
    id: 'pro',
    nome: 'Pro',
    icon: Crown,
    iconColor: '#5b6ef5',
    iconBg: '#f0f4ff',
    preco: 49,
    precoLabel: 'R$ 49',
    descLabel: '/mês',
    descricao: 'Para empresas que precisam de mais poder.',
    itens: [
      'Tudo do Starter',
      'Vendas ilimitadas',
      'Exportação Excel',
      'Gráficos avançados',
      'Suporte prioritário',
    ],
    highlight: true,
  },
  {
    id: 'business',
    nome: 'Business',
    icon: Building2,
    iconColor: '#7c3aed',
    iconBg: '#f5f3ff',
    preco: 99,
    precoLabel: 'R$ 99',
    descLabel: '/mês',
    descricao: 'Para empresas que precisam de tudo.',
    itens: [
      'Tudo do Pro',
      'Multi-empresas',
      'API de integração',
      'Relatórios personalizados',
      'Gerente de conta dedicado',
    ],
    highlight: false,
  },
]

export default function PlanosPage() {
  const router = useRouter()
  const session = getSession()
  const [loading, setLoading] = useState(null)
  const [erro, setErro] = useState('')

  async function handleAssinar(plano) {
    setErro('')
    setLoading(plano.id)

    try {
      // Plano gratuito — apenas confirma
      if (plano.preco === 0) {
        await new Promise(r => setTimeout(r, 600))
        router.push('/dashboard')
        return
      }

      const res = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planoId: plano.id,
          email: session?.email || '',
          nome: session?.name || '',
        }),
      })

      const data = await res.json()

      if (data.error) {
        setErro(data.error)
        setLoading(null)
        return
      }

      if (data.free) {
        router.push('/dashboard')
        return
      }

      // Redireciona para o checkout do Mercado Pago
      if (data.url) {
        window.location.href = data.url
      }
    } catch (e) {
      setErro('Erro de conexão. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div>
      <Navbar title="Planos e Assinatura" subtitle="Escolha o plano ideal para seu negócio" />
      <div className="p-4 sm:p-6 max-w-5xl space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <h2 className="font-bold text-gray-900 text-lg mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Plano atual: <span style={{ color: '#4350e8' }}>Starter (Grátis)</span>
          </h2>
          <p className="text-sm text-gray-500">Faça upgrade a qualquer momento para desbloquear mais recursos.</p>
        </div>

        {/* Erro */}
        {erro && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{erro}</p>
          </div>
        )}

        {/* Planos — 1 col mobile, 3 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PLANOS.map((plano) => {
            const Icon = plano.icon
            const isLoading = loading === plano.id

            return (
              <div key={plano.id} className="bg-white rounded-2xl border-2 p-5 sm:p-6 flex flex-col relative"
                style={{
                  borderColor: plano.highlight ? '#5b6ef5' : '#f1f5f9',
                  boxShadow: plano.highlight ? '0 8px 30px rgba(91,110,245,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                }}>

                {plano.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)' }}>
                    ⭐ Mais popular
                  </div>
                )}

                {/* Icon + Nome */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: plano.iconBg }}>
                    <Icon size={18} style={{ color: plano.iconColor }} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{plano.nome}</p>
                    <p className="text-xs text-gray-400">{plano.descricao}</p>
                  </div>
                </div>

                {/* Preço */}
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {plano.precoLabel}
                  </span>
                  <span className="text-sm text-gray-400">{plano.descLabel}</span>
                </div>

                {/* Itens */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plano.itens.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#5b6ef5' }} />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Botão */}
                <button
                  onClick={() => handleAssinar(plano)}
                  disabled={!!loading}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                  style={plano.highlight
                    ? { background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', color: 'white', boxShadow: '0 4px 14px rgba(91,110,245,0.35)' }
                    : { background: '#f8fafc', color: '#374151', border: '1px solid #e5e7eb' }
                  }>
                  {isLoading
                    ? <><Loader2 size={15} className="animate-spin" />Processando...</>
                    : plano.preco === 0
                      ? 'Usar plano grátis'
                      : <><ExternalLink size={15} />Assinar por {plano.precoLabel}/mês</>
                  }
                </button>
              </div>
            )
          })}
        </div>

        {/* Info Mercado Pago */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff7e6' }}>
            <span className="text-lg">💳</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm mb-0.5">Pagamento seguro via Mercado Pago</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Aceitamos cartão de crédito, débito e PIX. A cobrança é mensal e você pode cancelar a qualquer momento sem multa.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Visa', 'Master', 'PIX', 'Elo'].map(b => (
              <span key={b} className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 bg-gray-50">{b}</span>
            ))}
          </div>
        </div>

        {/* Cancelamento */}
        <p className="text-xs text-center text-gray-400 pb-2">
          Cancele quando quiser • Sem fidelidade • Dados protegidos pela LGPD
        </p>

      </div>
    </div>
  )
}