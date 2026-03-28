'use client'
// ============================================================
// app/admin/login/page.js
// Tela de acesso ao painel admin.
// Protegida por ADMIN_SECRET_KEY — variável de ambiente
// que só você conhece. Não aparece em nenhum código público.
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [chave, setChave]     = useState('')
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!chave.trim()) { setErro('Digite a chave de acesso.'); return }
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave }),
      })
      const data = await res.json()

      if (data.ok) {
        // Salva token de sessão admin no sessionStorage
        // sessionStorage expira ao fechar o navegador
        sessionStorage.setItem('admin_token', data.token)
        router.push('/admin')
      } else {
        setErro('Chave de acesso incorreta.')
      }
    } catch {
      setErro('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Área Restrita
          </h1>
          <p className="text-sm text-gray-500 mt-1">Acesso exclusivo ao administrador</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-400">Chave de acesso</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={chave}
                  onChange={e => setChave(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="off"
                  className="w-full pl-9 pr-10 py-3 text-sm rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                />
                <button type="button" onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="text-xs px-3 py-2.5 rounded-xl bg-red-950 border border-red-900 text-red-400">
                {erro}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
              {loading
                ? <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Verificando...</>
                : <><Shield size={15} />Acessar painel</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-700 mt-4">
          Esta página não é indexada nem listada publicamente.
        </p>
      </div>
    </div>
  )
}