// ============================================================
// app/login/page.js
// ALTERADO: Adicionadas abas Login / Cadastro.
//           Login agora usa Supabase Auth via lib/auth.js.
//           Cadastro envia email de confirmação real.
//           Adicionada recuperação de senha.
// ============================================================
'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
// ALTERADO: importa login/cadastrar do novo auth.js com Supabase
import { login, cadastrar, recuperarSenha, getSession } from '../../lib/auth'
import { Zap, Eye, EyeOff, ArrowRight, ArrowLeft, Lock, UserPlus, Mail, CheckCircle } from 'lucide-react'

const ic = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl bg-gray-50 transition-all outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white"

// ── Tela de login ─────────────────────────────────────────────
function TabLogin({ onForgot }) {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Preencha e-mail e senha.'); return }
    setLoading(true)
    // ALTERADO: chama login() do Supabase
    const { user, error: err } = await login(email, password)
    if (err) { setError(err); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">E-mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com" autoComplete="email" className={ic} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Senha</label>
          {/* NOVO: link para recuperação de senha */}
          <button type="button" onClick={onForgot}
            className="text-xs font-medium hover:underline" style={{ color: '#5b6ef5' }}>
            Esqueci minha senha
          </button>
        </div>
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" autoComplete="current-password" className={ic + ' pr-11'} />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white py-3 rounded-xl disabled:opacity-70 mt-1"
        style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', boxShadow: '0 4px 14px rgba(91,110,245,0.4)' }}>
        {loading
          ? <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Entrando...</>
          : <>Entrar <ArrowRight size={16} /></>}
      </button>
    </form>
  )
}

// ── Tela de cadastro ──────────────────────────────────────────
// NOVO: componente completo de cadastro com Supabase
function TabCadastro() {
  const [nome, setNome]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [sucesso, setSucesso]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!nome || !email || !password) { setError('Preencha todos os campos.'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    // NOVO: chama cadastrar() que cria usuário no Supabase
    //       e dispara email de confirmação automaticamente
    const { user, error: err } = await cadastrar({ email, password, nome })
    if (err) { setError(err); setLoading(false) }
    else setSucesso(true)
  }

  if (sucesso) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: '#dcfce7' }}>
          <CheckCircle size={28} style={{ color: '#16a34a' }} />
        </div>
        <h3 className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Verifique seu e-mail!
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Enviamos um link de confirmação para <strong className="text-gray-700">{email}</strong>.
          Clique no link para ativar sua conta.
        </p>
        <p className="text-xs text-gray-400">Não recebeu? Verifique a pasta de spam.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Nome completo</label>
        <input type="text" value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Seu nome" autoComplete="name" className={ic} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">E-mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com" autoComplete="email" className={ic} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Senha</label>
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Mín. 6 caracteres" className={ic + ' pr-11'} />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white py-3 rounded-xl disabled:opacity-70 mt-1"
        style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', boxShadow: '0 4px 14px rgba(91,110,245,0.4)' }}>
        {loading
          ? <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Criando conta...</>
          : <>Criar conta <UserPlus size={16} /></>}
      </button>
      <p className="text-xs text-center text-gray-400">
        Ao criar conta você concorda com nossos termos de uso.
      </p>
    </form>
  )
}

// ── Recuperação de senha ──────────────────────────────────────
// NOVO: tela para enviar email de recuperação de senha
function TelaRecuperacao({ onVoltar }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Digite seu e-mail.'); return }
    setLoading(true)
    // NOVO: chama recuperarSenha() do Supabase
    const { error: err } = await recuperarSenha(email)
    if (err) { setError(err); setLoading(false) }
    else setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: '#f0f4ff' }}>
          <Mail size={24} style={{ color: '#4350e8' }} />
        </div>
        <h3 className="font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>E-mail enviado!</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Enviamos um link para <strong className="text-gray-700">{email}</strong>.
          Clique nele para criar uma nova senha.
        </p>
        <button onClick={onVoltar} className="text-sm font-medium" style={{ color: '#5b6ef5' }}>
          Voltar ao login
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-bold text-gray-900 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Recuperar senha
        </h3>
        <p className="text-sm text-gray-400">Digite seu e-mail e enviaremos um link de recuperação.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com" className={ic} />
        </div>
        {error && (
          <div className="text-sm px-4 py-3 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>{error}</div>
        )}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-white py-3 rounded-xl disabled:opacity-70"
          style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)' }}>
          {loading
            ? <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Enviando...</>
            : <>Enviar link <Mail size={16} /></>}
        </button>
      </form>
      <button onClick={onVoltar} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        <ArrowLeft size={14} /> Voltar ao login
      </button>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────

// ── Conteúdo principal (separado para Suspense) ───────────────
// NOVO: separado em componente próprio pois usa useSearchParams()
//       que requer estar dentro de <Suspense>
function LoginConteudo() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const [aba, setAba] = useState('login')

  // NOVO: exibe mensagem se link de confirmação for inválido/expirado
  const erroUrl = searchParams.get('erro')

  useEffect(() => {
    // ALTERADO: verifica sessão do Supabase, não do localStorage
    import('../../lib/auth').then(({ getSessionAsync }) => {
      getSessionAsync().then(session => {
        if (session) router.replace('/dashboard')
      })
    })
  }, [router])

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* PAINEL ESQUERDO */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#3640cc 0%,#5b6ef5 50%,#7c3aed 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="absolute bottom-20 -left-20 w-60 h-60 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>AutoReport AI</p>
            <p className="text-white text-xs uppercase tracking-widest" style={{ opacity: 0.6 }}>Platform</p>
          </div>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Gestão empresarial inteligente
          </h2>
          <p className="text-white text-base leading-relaxed" style={{ opacity: 0.75 }}>
            Relatórios automáticos, controle financeiro e dashboard em tempo real.
          </p>
          {[
            'Dashboard com KPIs em tempo real',
            'Gestão completa de vendas e finanças',
            'Exportação PDF e Excel em 1 clique',
            'Acesso seguro com verificação de e-mail',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <CheckCircle size={16} className="text-white flex-shrink-0" style={{ opacity: 0.8 }} />
              <span className="text-white text-sm" style={{ opacity: 0.85 }}>{item}</span>
            </div>
          ))}
        </div>
        <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} AutoReport AI. Todos os direitos reservados.
        </p>
      </div>

      {/* PAINEL DIREITO */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5b6ef5,#3640cc)' }}>
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>AutoReport AI</span>
          </div>
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-500">
            <ArrowLeft size={14} /> Voltar
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            <Link href="/" className="hidden lg:inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8">
              <ArrowLeft size={14} /> Voltar para o site
            </Link>

            {/* NOVO: exibe aviso se link de email for inválido */}
            {erroUrl === 'link-invalido' && (
              <div className="mb-4 text-sm px-4 py-3 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                O link expirou ou é inválido. Solicite um novo abaixo.
              </div>
            )}

            {aba === 'recuperacao' ? (
              <TelaRecuperacao onVoltar={() => setAba('login')} />
            ) : (
              <>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-6" style={{ background: '#f0f4ff' }}>
                  {aba === 'login' ? <Lock size={20} style={{ color: '#4350e8' }} /> : <UserPlus size={20} style={{ color: '#4350e8' }} />}
                </div>

                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                  {[
                    { key: 'login',    label: 'Entrar' },
                    { key: 'cadastro', label: 'Criar conta' },
                  ].map(t => (
                    <button key={t.key} onClick={() => setAba(t.key)}
                      className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                      style={aba === t.key
                        ? { background: 'white', color: '#1e293b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                        : { color: '#94a3b8' }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {aba === 'login'
                  ? <TabLogin onForgot={() => setAba('recuperacao')} />
                  : <TabCadastro />
                }
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

// NOVO: Suspense necessário pois LoginConteudo usa useSearchParams()
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <LoginConteudo />
    </Suspense>
  )
}