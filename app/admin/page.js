'use client'
// ============================================================
// app/admin/page.js
// Painel exclusivo do administrador.
// Dados reais puxados da API /api/admin via Supabase.
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

import AdminGuard from '../../components/AdminGuard'
import {
  Users, UserCheck, Activity, Crown, TrendingUp,
  RefreshCw, Shield, LogOut, Mail, Calendar,
  CheckCircle, XCircle, Clock, Zap, BarChart2
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

// ── Componentes auxiliares ───────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = '#4350e8', bg = '#f0f4ff' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
          <Icon size={17} style={{ color }} />
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none mb-1"
        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function Badge({ plano }) {
  const map = {
    starter:  { label: 'Starter',  bg: '#f1f5f9', color: '#64748b' },
    pro:      { label: 'Pro',      bg: '#f0f4ff', color: '#4350e8' },
    business: { label: 'Business', bg: '#f5f3ff', color: '#7c3aed' },
  }
  const s = map[plano] || map.starter
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}>{s.label}</span>
  )
}

function StatusBadge({ status }) {
  const map = {
    ativo:     { label: 'Ativo',     bg: '#dcfce7', color: '#16a34a', icon: CheckCircle },
    inativo:   { label: 'Inativo',   bg: '#f1f5f9', color: '#94a3b8', icon: Clock },
    bloqueado: { label: 'Bloqueado', bg: '#fee2e2', color: '#dc2626', icon: XCircle },
  }
  const s = map[status] || map.ativo
  const Icon = s.icon
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      <Icon size={10} />{s.label}
    </span>
  )
}

function formatarData(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// ── Página principal ─────────────────────────────────────────
function AdminConteudo() {
  const router = useRouter()
  const [dados, setDados]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro]       = useState('')
  const [periodo, setPeriodo] = useState('30')
  const [busca, setBusca]     = useState('')
  const [abaTabela, setAbaTabela] = useState('todos') // 'todos' | 'ativos'

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro('')
    try {
      const token = sessionStorage.getItem('admin_token')
      if (!token) { router.replace('/admin/login'); return }

      const res = await fetch(`/api/admin?periodo=${periodo}`, {
        headers: { 'x-admin-token': token }
      })
      const json = await res.json()

      if (!res.ok) { setErro(json.error || 'Erro ao carregar dados'); return }
      setDados(json)
    } catch (e) {
      setErro('Erro de conexão com o servidor.')
    } finally {
      setLoading(false)
    }
  }, [periodo, router])

  useEffect(() => { carregar() }, [carregar])

  function handleLogout() {
    sessionStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  async function toggleStatus(userId, statusAtual) {
    const novoStatus = statusAtual === 'ativo' ? 'bloqueado' : 'ativo'
    const token = sessionStorage.getItem('admin_token')
    await fetch('/api/admin', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token
      },
      body: JSON.stringify({ userId, status: novoStatus })
    })
    carregar()
  }

  const usuariosFiltrados = (dados?.usuarios || []).filter(u => {
    const termo = busca.toLowerCase()
    return u.email?.toLowerCase().includes(termo) || u.nome?.toLowerCase().includes(termo)
  })

  const tabelaAtual = abaTabela === 'ativos'
    ? dados?.ativosNoPeriodo || []
    : usuariosFiltrados

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR ADMIN */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
              <Shield size={15} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Painel Admin</p>
              <p className="text-xs text-gray-400">AutoReport AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={carregar} disabled={loading}
              className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => router.push('/dashboard')}
              className="text-xs font-medium text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors hidden sm:flex items-center gap-1.5">
              <Zap size={12} /> App
            </button>
            <button onClick={handleLogout}
              className="text-xs font-medium text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition-colors flex items-center gap-1.5">
              <LogOut size={12} /> Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Dashboard Administrativo</h1>
            <p className="text-sm text-gray-500 mt-0.5">Dados reais dos seus clientes e usuários</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500">Período:</label>
            <select value={periodo} onChange={e => setPeriodo(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-indigo-400">
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </div>

        {/* ERRO */}
        {erro && (
          <div className="flex items-center gap-3 p-4 rounded-2xl border"
            style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
            <XCircle size={18} style={{ color: '#ef4444' }} />
            <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{erro}</p>
          </div>
        )}

        {/* STATS CARDS */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse"
                style={{ background: '#f8fafc' }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard icon={Users}     label="Total de usuários"  value={dados?.stats?.total_usuarios}  sub="cadastros totais"           color="#4350e8" bg="#f0f4ff" />
            <StatCard icon={UserCheck} label="Ativos agora"       value={dados?.stats?.usuarios_ativos} sub="status ativo"               color="#059669" bg="#ecfdf5" />
            <StatCard icon={Activity}  label={`Ativos (${periodo}d)`} value={dados?.stats?.ativos_7d ?? dados?.ativosNoPeriodo?.length} sub="fizeram login"  color="#7c3aed" bg="#f5f3ff" />
            <StatCard icon={TrendingUp} label={`Novos (${periodo}d)`} value={dados?.stats?.novos_30d}  sub="novos cadastros"            color="#d97706" bg="#fffbeb" />
          </div>
        )}

        {/* GRÁFICO DE CADASTROS */}
        {!loading && dados?.cadastrosPorDia?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={16} style={{ color: '#4350e8' }} />
              <h2 className="font-bold text-gray-900 text-sm"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Novos cadastros — últimos {periodo} dias
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={dados.cadastrosPorDia} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#5b6ef5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5b6ef5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }}
                  formatter={(v) => [v, 'Cadastros']}
                />
                <Area type="monotone" dataKey="total" stroke="#5b6ef5" strokeWidth={2} fill="url(#gradAdmin)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* PLANOS BREAKDOWN */}
        {!loading && dados?.stats && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Starter', value: dados.stats.plano_starter, color: '#64748b', bg: '#f1f5f9' },
              { label: 'Pro',     value: dados.stats.plano_pro,     color: '#4350e8', bg: '#f0f4ff' },
              { label: 'Business',value: dados.stats.plano_business,color: '#7c3aed', bg: '#f5f3ff' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 text-center"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: p.bg }}>
                  <Crown size={15} style={{ color: p.color }} />
                </div>
                <p className="text-xl font-bold text-gray-900">{p.value ?? 0}</p>
                <p className="text-xs text-gray-500">{p.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* TABELA DE USUÁRIOS */}
        <div className="bg-white rounded-2xl border border-gray-100"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>

          {/* Header da tabela */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {[
                { key: 'todos',  label: `Todos (${dados?.usuarios?.length ?? 0})` },
                { key: 'ativos', label: `Ativos no período (${dados?.ativosNoPeriodo?.length ?? 0})` },
              ].map(t => (
                <button key={t.key} onClick={() => setAbaTabela(t.key)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                  style={abaTabela === t.key
                    ? { background: 'white', color: '#1e293b', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                    : { color: '#94a3b8' }}>
                  {t.label}
                </button>
              ))}
            </div>
            {abaTabela === 'todos' && (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                <input value={busca} onChange={e => setBusca(e.target.value)}
                  placeholder="Buscar por email ou nome..."
                  className="pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-400 w-full sm:w-56" />
              </div>
            )}
          </div>

          {/* Mobile: cards */}
          <div className="sm:hidden divide-y divide-gray-50">
            {loading ? [...Array(4)].map((_, i) => (
              <div key={i} className="p-4"><div className="h-14 rounded-xl animate-pulse" style={{ background: '#f1f5f9' }} /></div>
            )) : tabelaAtual.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">Nenhum usuário encontrado</div>
            ) : tabelaAtual.map(u => (
              <div key={u.id} className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#7b91ff,#8b5cf6)' }}>
                  {(u.nome || u.email)?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{u.nome || '—'}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  <p className="text-xs text-gray-400">Login: {formatarData(u.ultimo_login)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {u.plano && <Badge plano={u.plano} />}
                  {u.status && <StatusBadge status={u.status} />}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Usuário', 'Email', 'Plano', 'Status', 'Último login', 'Cadastro'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 rounded animate-pulse w-24" style={{ background: '#f1f5f9' }} />
                    </td>
                  ))}</tr>
                )) : tabelaAtual.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">Nenhum usuário encontrado</td></tr>
                ) : tabelaAtual.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#7b91ff,#8b5cf6)' }}>
                          {(u.nome || u.email)?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-800 truncate max-w-32">{u.nome || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{u.email}</td>
                    <td className="px-5 py-3.5">{u.plano ? <Badge plano={u.plano} /> : '—'}</td>
                    <td className="px-5 py-3.5">{u.status ? <StatusBadge status={u.status} /> : '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{formatarData(u.ultimo_login)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{formatarData(u.criado_em)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && tabelaAtual.length > 0 && (
            <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">
              {tabelaAtual.length} usuário(s) encontrado(s)
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// Envolve em AdminGuard para proteger a rota
export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminConteudo />
    </AdminGuard>
  )
}