'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function PagamentoCanceladoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 max-w-md w-full text-center"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>

        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#fef2f2' }}>
          <XCircle size={32} style={{ color: '#ef4444' }} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Pagamento não realizado
        </h1>

        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          O pagamento foi cancelado ou não foi concluído. Nenhum valor foi cobrado. Você pode tentar novamente quando quiser.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/planos"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl"
            style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)' }}>
            <RefreshCw size={15} /> Tentar novamente
          </Link>
          <Link href="/dashboard"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50">
            <ArrowLeft size={15} /> Voltar ao dashboard
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Precisa de ajuda? <a href="mailto:suporte@autoreport.ai" className="underline">suporte@autoreport.ai</a>
        </p>
      </div>
    </div>
  )
}