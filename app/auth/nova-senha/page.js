// ============================================================
// app/auth/nova-senha/page.js
// NOVO: Tela para o usuário definir nova senha após clicar
//       no link de recuperação recebido por email.
// ============================================================
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { redefinirSenha } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react'

const ic = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 transition-all outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white"

function NovaSenhaForm() {
  const router      = useRouter()
  const params      = useSearchParams()
  const [senha, setSenha]         = useState('')
  const [confirma, setConfirma]   = useState('')
  const [showP1, setShowP1]       = useState(false)
  const [showP2, setShowP2]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [sucesso, setSucesso]     = useState(false)
  const [pronto, setPronto]       = useState(false)

  useEffect(() => {
    // NOVO: O Supabase envia o token na URL como fragment (#access_token=...)
    // O onAuthStateChange captura quando a sessão é estabelecida via link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setPronto(true)
    })
    // Tenta pegar sessão existente também
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPronto(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (senha.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (senha !== confirma) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    const { error: err } = await redefinirSenha(senha)
    if (err) { setError(err); setLoading(false) }
    else {
      setSucesso(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    }
  }

  if (!pronto) {
    return (
      <div className="text-center space-y-3">
        <Loader2 size={28} className="animate-spin mx-auto" style={{ color: '#5b6ef5' }} />
        <p className="text-sm text-gray-500">Verificando link de recuperação...</p>
      </div>
    )
  }

  if (sucesso) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: '#dcfce7' }}>
          <CheckCircle size={28} style={{ color: '#16a34a' }} />
        </div>
        <h3 className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Senha atualizada!</h3>
        <p className="text-sm text-gray-500">Redirecionando para o dashboard...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Nova senha</h2>
        <p className="text-sm text-gray-400">Digite e confirme sua nova senha.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Nova senha</label>
        <div className="relative">
          <input type={showP1 ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="Mín. 6 caracteres" className={ic + ' pr-11'} />
          <button type="button" onClick={() => setShowP1(!showP1)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showP1 ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Confirmar senha</label>
        <div className="relative">
          <input type={showP2 ? 'text' : 'password'} value={confirma} onChange={e => setConfirma(e.target.value)}
            placeholder="Repita a senha" className={ic + ' pr-11'} />
          <button type="button" onClick={() => setShowP2(!showP2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showP2 ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>{error}</div>
      )}
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white py-3 rounded-xl disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', boxShadow: '0 4px 14px rgba(91,110,245,0.4)' }}>
        {loading ? <><Loader2 size={15} className="animate-spin" />Salvando...</> : <><Lock size={15} />Salvar nova senha</>}
      </button>
    </form>
  )
}

export default function NovaSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 w-full max-w-sm"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
        <Suspense fallback={<div className="text-center"><Loader2 size={24} className="animate-spin mx-auto" style={{ color: '#5b6ef5' }} /></div>}>
          <NovaSenhaForm />
        </Suspense>
      </div>
    </div>
  )
}