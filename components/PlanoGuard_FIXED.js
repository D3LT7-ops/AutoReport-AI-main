'use client'
// ============================================================
// app/(app)/planos/page.js
// Tela de planos — mostra o plano atual do usuário,
// permite upgrade via Mercado Pago e explica o que cada
// plano desbloqueia.
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../../../components/sidebar/Navbar'
import { usePlano } from '../../../lib/usePlano'
import {
  CheckCircle, XCircle, Crown, Zap, Building2,
  Loader2, AlertCircle, ExternalLink, Star,
  BarChart2, FileSpreadsheet, Users, Shield
} from 'lucide-react'

// ── Definição dos planos ─────────────────────────────────────
const PLANOS = [
  {
    id: 'starter',
    nome: 'Starter',
    icon: Zap,
    preco: 0,
    precoLabel: 'Grátis',
    precoSub: 'para sempre',
    cor: '#64748b',
    bg: '#f8fafc',
    borda: '#e2e8f0',
    descricao: 'Para começar e explorar a plataforma.',
    recursos: [
      { label: 'Dashboard básico',       ok: true  },
      { label: 'Até 50 vendas por mês',  ok: true  },
      { label: 'Controle financeiro',    ok: true  },
      { label: 'Exportação PDF',         ok: true  },
      { label: 'Exportação Excel',       ok: false },
      { label: 'Gráficos avançados',     ok: false },
      { label: 'Relatórios ilimitados',  ok: false },
      { label: 'Suporte prioritário',    ok: false },
    ],
  },
  {
    id: 'pro',
    nome: 'Pro',
    icon: Crown,
    preco: 49,
    precoLabel: 'R$ 49',
    precoSub: '/mês',
    cor: '#4350e8',
    bg: '#f0f4ff',
    borda: '#c7d6ff',
    destaque: true,
    descricao: 'Para empresas que precisam de mais poder.',
    recursos: [
      { label: 'Tudo do Starter',        ok: true },
      { label: 'Vendas ilimitadas',      ok: true },
      { label: 'Exportação Excel',       ok: true },
      { label: 'Gráficos avançados',     ok: true },
      { label: 'Relatórios ilimitados',  ok: true },
      { label: 'Suporte prioritário',    ok: true },
      { label: 'Multi-empresas',         ok: false },
      { label: 'API de integração',      ok: false },
    ],
  },
  {
    id: 'business',
    nome: 'Business',
    icon: Building2,
    preco: 99,
    precoLabel: 'R$ 99',
    precoSub: '/mês',
    cor: '#7c3aed',
    bg: '#f5f3ff',
    borda: '#ddd6fe',
    descricao: 'Para empresas que precisam de tudo.',
    recursos: [
      { label: 'Tudo do Pro',              ok: true },
      { label: 'Multi-empresas',           ok: true },
      { label: 'API de integração',        ok: true },
      { label: 'Relatórios personalizados',ok: true },
      { label: 'Gerente de conta',         ok: true },
      { label: 'SLA garantido',            ok: true },
      { label: 'Onboarding dedicado',      ok: true },
      { label: 'Acesso antecipado',        ok: true },
    ],
  },
]

// ── Comparativo de recursos por plano ───────────────────────
const COMPARATIVO = [
  { recurso: 'Dashboard',           starter: true,  pro: true,  business: true  },
  { recurso: 'Vendas',              starter: '50/mês', pro: 'Ilimitadas', business: 'Ilimitadas' },
  { recurso: 'Controle financeiro', starter: true,  pro: true,  business: true  },
  { recurso: 'Exportação PDF',      starter: true,  pro: true,  business: true  },
  { recurso: 'Exportação Excel',    starter: false, pro: true,  business: true  },
  { recurso: 'Gráficos avançados',  starter: false, pro: true,  business: true  },
  { recurso: 'Relatórios',          starter: 'Básico', pro: 'Ilimitados', business: 'Personalizados' },
  { recurso: 'Suporte',             starter: 'E-mail', pro: 'Prioritário', business: 'Gerente dedicado' },
  { recurso: 'Multi-empresas',      starter: false, pro: false, business: true  },
  { recurso: 'API de integração',   starter: false, pro: false, business: true  },
]

function CelulaTabela({ valor }) {
  if (valor === true)  return <CheckCircle size={16} style={{ color: '#16a34a' }} className="mx-auto" />
  if (valor === false) return <XCircle     size={16} style={{ color: '#cbd5e1' }} className="mx-auto" />
  return <span className="text-xs font-medium text-gray-600">{valor}</span>
}

// ── Componente principal ─────────────────────────────────────
export default function PlanosPage() {
  const router                   = useRouter()
  const { plano, ativo, loading: loadingPlano, isPro, isBusiness } = usePlano()
  const [loadingId, setLoadingId] = useState(null)
  const [erro, setErro]           = useState('')

  // Determina plano atual
  const planoAtual = !ativo ? 'starter' : plano

  async function handleAssinar(p) {
    setErro('')

    // Já tem esse plano
    if (p.id === planoAtual && ativo) return

    // Plano gratuito — já está ativo
    if (p.preco === 0) {
      router.push('/dashboard')
      return
    }

    setLoadingId(p.id)
    try {
      const res = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planoId: p.id }),
      })
      const data = await res.json()

      if (data.error) { setErro(data.error); return }
      if (data.url)   window.location.href = data.url
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      <Navbar title="Planos" subtitle="Escolha o melhor plano para o seu negócio" />
      <div className="p-4 sm:p-6 max-w-6xl space-y-6 sm:space-y-8">

        {/* Plano atual */}
        {!loadingPlano && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: ativo ? '#f0f4ff' : '#f8fafc' }}>
                {ativo ? <Crown size={18} style={{ color: '#4350e8' }} /> : <Zap size={18} style={{ color: '#94a3b8' }} />}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Seu plano atual:{' '}
                  <span style={{ color: ativo ? '#4350e8' : '#64748b' }}>
                    {planoAtual.charAt(0).toUpperCase() + planoAtual.slice(1)}
                    {ativo ? ' ✓ Ativo' : ' (gratuito)'}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ativo
                    ? 'Você tem acesso a todos os recursos do seu plano.'
                    : 'Faça upgrade para desbloquear recursos avançados.'}
                </p>
              </div>
            </div>
            {!ativo && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#fef9c3', color: '#92400e' }}>
                ⚡ Upgrade disponível
              </span>
            )}
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
            <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: '#dc2626' }}>{erro}</p>
          </div>
        )}

        {/* Cards dos planos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {PLANOS.map((p) => {
            const Icon      = p.icon
            const atual     = p.id === planoAtual && (p.id === 'starter' ? !ativo : ativo)
            const isLoading = loadingId === p.id

            return (
              <div key={p.id}
                className="bg-white rounded-2xl flex flex-col relative transition-all"
                style={{
                  border: `2px solid ${atual ? p.cor : p.destaque ? p.borda : '#f1f5f9'}`,
                  boxShadow: atual
                    ? `0 8px 30px ${p.cor}22`
                    : p.destaque
                      ? `0 8px 30px ${p.cor}18`
                      : '0 1px 3px rgba(0,0,0,0.06)',
                }}>

                {/* Badge "mais popular" */}
                {p.destaque && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-bold text-white px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ background: `linear-gradient(135deg,${p.cor},${p.cor}cc)` }}>
                    <Star size={10} /> Mais popular
                  </div>
                )}

                {/* Badge "plano atual" */}
                {atual && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-bold text-white px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ background: `linear-gradient(135deg,${p.cor},${p.cor}cc)` }}>
                    <CheckCircle size={10} /> Plano atual
                  </div>
                )}

                <div className="p-5 sm:p-6 flex-1">
                  {/* Ícone + Nome */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: p.bg }}>
                      <Icon size={18} style={{ color: p.cor }} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.nome}</p>
                      <p className="text-xs text-gray-400">{p.descricao}</p>
                    </div>
                  </div>

                  {/* Preço */}
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-3xl font-bold text-gray-900"
                      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.precoLabel}</span>
                    <span className="text-sm text-gray-400">{p.precoSub}</span>
                  </div>

                  {/* Recursos */}
                  <ul className="space-y-2.5">
                    {p.recursos.map((r, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        {r.ok
                          ? <CheckCircle size={14} className="flex-shrink-0" style={{ color: p.cor }} />
                          : <XCircle    size={14} className="flex-shrink-0" style={{ color: '#e2e8f0' }} />
                        }
                        <span style={{ color: r.ok ? '#374151' : '#94a3b8' }}>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Botão */}
                <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                  <button
                    onClick={() => handleAssinar(p)}
                    disabled={!!loadingId || atual}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                    style={atual
                      ? { background: '#f1f5f9', color: '#94a3b8', cursor: 'default' }
                      : p.destaque || p.preco > 0
                        ? { background: `linear-gradient(135deg,${p.cor},${p.cor}cc)`, color: 'white', boxShadow: `0 4px 14px ${p.cor}44` }
                        : { background: '#f8fafc', color: '#374151', border: '1px solid #e5e7eb' }
                    }>
                    {isLoading
                      ? <><Loader2 size={14} className="animate-spin" />Processando...</>
                      : atual
                        ? <><CheckCircle size={14} />Plano ativo</>
                        : p.preco === 0
                          ? 'Usar grátis'
                          : <><ExternalLink size={14} />Assinar {p.nome}</>
                    }
                  </button>
                </div>

              </div>
            )
          })}
        </div>

        {/* Tabela comparativa (desktop) */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hidden sm:block"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Comparativo completo
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/2">Recurso</th>
                  {PLANOS.map(p => (
                    <th key={p.id} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: p.cor }}>
                      {p.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARATIVO.map((row, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="px-6 py-3 text-sm text-gray-700 font-medium">{row.recurso}</td>
                    <td className="px-4 py-3 text-center"><CelulaTabela valor={row.starter} /></td>
                    <td className="px-4 py-3 text-center"><CelulaTabela valor={row.pro} /></td>
                    <td className="px-4 py-3 text-center"><CelulaTabela valor={row.business} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info de pagamento */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#fff7e6' }}>
            <Shield size={18} style={{ color: '#d97706' }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 text-sm mb-0.5">Pagamento seguro via Mercado Pago</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Cobrança mensal automática. Cancele quando quiser sem multa. Aceito: cartão de crédito, débito e PIX.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Visa', 'Master', 'PIX', 'Elo'].map(b => (
              <span key={b} className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 bg-gray-50">{b}</span>
            ))}
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 pb-2">
          Cancele quando quiser · Sem fidelidade · Protegido pela LGPD
        </p>

      </div>
    </div>
  )
}