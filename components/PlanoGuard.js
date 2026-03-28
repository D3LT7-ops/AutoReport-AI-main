'use client'
import { useRouter } from 'next/navigation'
import { usePlano } from '../lib/usePlano'
import { Crown, Lock, Zap, ArrowRight, Loader2 } from 'lucide-react'

const PLANOS = {
  pro:      { label: 'Pro',      preco: 'R$ 49/mês', cor: '#4350e8' },
  business: { label: 'Business', preco: 'R$ 99/mês', cor: '#7c3aed' },
}

export default function PlanoGuard({ planoMinimo = 'pro', children }) {
  const router = useRouter()
  const { plano, ativo, loading, isPro, isBusiness } = usePlano()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin" style={{ color: '#94a3b8' }} />
      </div>
    )
  }

  const temAcesso =
    planoMinimo === 'pro'      ? (isPro || isBusiness) :
    planoMinimo === 'business' ? isBusiness :
    true

  if (temAcesso) return children

  const info = PLANOS[planoMinimo] || PLANOS.pro

  return (
    <div className="flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="max-w-sm w-full text-center">
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${info.cor}22,${info.cor}11)`, border: `2px solid ${info.cor}33` }}>
            <Lock size={32} style={{ color: info.cor }} />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${info.cor},${info.cor}cc)` }}>
            <Crown size={14} className="text-white" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Recurso exclusivo do plano {info.label}
        </h2>
        <p className="text-sm text-gray-500 mb-2 leading-relaxed">
          {plano === 'starter' || !ativo
            ? 'Você está no plano gratuito. Faça upgrade para desbloquear este recurso.'
            : `Seu plano atual não inclui este recurso. Faça upgrade para o ${info.label}.`}
        </p>
        <p className="text-xs text-gray-400 mb-8">
          A partir de <strong style={{ color: info.cor }}>{info.preco}</strong> · Cancele quando quiser
        </p>
        <div className="space-y-3">
          <button onClick={() => router.push('/planos')}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-2xl transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${info.cor},${info.cor}cc)`, boxShadow: `0 8px 24px ${info.cor}44` }}>
            <Zap size={15} /> Fazer upgrade para {info.label} <ArrowRight size={15} />
          </button>
          <button onClick={() => router.back()}
            className="w-full py-2.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
