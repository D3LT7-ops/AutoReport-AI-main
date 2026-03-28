'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

function SucessoConteudo() {
  const params = useSearchParams()
  const [status, setStatus] = useState('verificando')

  useEffect(() => {
    const paymentStatus = params.get('status')
    if (paymentStatus === 'approved' || paymentStatus === 'authorized') {
      setStatus('aprovado')
    } else if (paymentStatus === 'pending' || paymentStatus === 'in_process') {
      setStatus('pendente')
    } else {
      setStatus('aprovado')
    }
  }, [params])

  if (status === 'verificando') {
    return (
      <div className="text-center">
        <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#5b6ef5' }} />
        <p className="text-gray-500 text-sm">Verificando pagamento...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 max-w-md w-full text-center"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: status === 'aprovado' ? '#dcfce7' : '#fef9c3' }}>
        <CheckCircle size={32} style={{ color: status === 'aprovado' ? '#16a34a' : '#ca8a04' }} />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {status === 'aprovado' ? 'Pagamento confirmado!' : 'Pagamento em análise'}
      </h1>
      <p className="text-gray-500 text-sm mb-8 leading-relaxed">
        {status === 'aprovado'
          ? 'Sua assinatura foi ativada com sucesso. Bem-vindo ao AutoReport AI!'
          : 'Seu pagamento está sendo processado. Você receberá confirmação por e-mail em breve.'}
      </p>
      <Link href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl"
        style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', boxShadow: '0 4px 14px rgba(91,110,245,0.35)' }}>
        Ir para o Dashboard <ArrowRight size={16} />
      </Link>
      <p className="text-xs text-gray-400 mt-6">
        Dúvidas? <a href="mailto:suporte@autoreport.ai" className="underline">suporte@autoreport.ai</a>
      </p>
    </div>
  )
}

export default function PagamentoSucessoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#5b6ef5' }} />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      }>
        <SucessoConteudo />
      </Suspense>
    </div>
  )
}