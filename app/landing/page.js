'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Zap, BarChart2, FileText, TrendingUp, ShoppingCart,
  DollarSign, ArrowRight, CheckCircle, Menu, X,
  Shield, Smartphone
} from 'lucide-react'

const features = [
  { icon: BarChart2,    title: 'Dashboard Inteligente',  desc: 'KPIs, gráficos e métricas do negócio em tempo real.' },
  { icon: ShoppingCart, title: 'Gestão de Vendas',       desc: 'Cadastre, edite e acompanhe cada venda com controle total.' },
  { icon: DollarSign,   title: 'Controle Financeiro',    desc: 'Receitas, despesas, saldo e fluxo de caixa.' },
  { icon: FileText,     title: 'Relatórios Automáticos', desc: 'PDF e Excel profissionais em 1 clique.' },
  { icon: Shield,       title: 'Acesso Seguro',          desc: 'Login protegido e dados isolados por empresa.' },
  { icon: Smartphone,   title: '100% Responsivo',        desc: 'Funciona perfeitamente no celular, tablet e desktop.' },
]

const plans = [
  { name: 'Starter', price: 'Grátis', desc: 'Para começar',   items: ['Dashboard básico', 'Até 50 vendas/mês', 'Relatórios PDF', 'Suporte por e-mail'],                                          cta: 'Começar grátis',  highlight: false },
  { name: 'Pro',     price: 'R$ 49',  desc: '/mês',           items: ['Tudo do Starter', 'Vendas ilimitadas', 'Exportação Excel', 'Gráficos avançados', 'Suporte prioritário'],                    cta: 'Assinar Pro',     highlight: true  },
  { name: 'Business',price: 'R$ 99',  desc: '/mês',           items: ['Tudo do Pro', 'Multi-empresas', 'API de integração', 'Relatórios personalizados', 'Gerente de conta'],                      cta: 'Falar com vendas',highlight: false },
]

const stats = [
  { value: '2.400+', label: 'Empresas ativas' },
  { value: 'R$ 1,2B', label: 'Em vendas gerenciadas' },
  { value: '98%',    label: 'Satisfação dos clientes' },
  { value: '< 2min', label: 'Para gerar um relatório' },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5b6ef5,#3640cc)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>AutoReport AI</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#funcionalidades" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Funcionalidades</a>
            <a href="#precos" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Preços</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors">
              Entrar
            </Link>
            <Link href="/login" className="text-sm font-semibold text-white px-4 py-2 rounded-xl"
              style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', boxShadow: '0 4px 14px rgba(91,110,245,0.35)' }}>
              Começar agora →
            </Link>
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200">
            {menuOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            <a href="#funcionalidades" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl">Funcionalidades</a>
            <a href="#precos" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl">Preços</a>
            <div className="pt-2 space-y-2 border-t border-gray-100 mt-2">
              <Link href="/login" className="block w-full text-center py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl">Entrar</Link>
              <Link href="/login" className="block w-full text-center py-2.5 text-sm font-semibold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)' }}>Começar agora →</Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#5b6ef5,transparent)' }} />
          <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#8b5cf6,transparent)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            style={{ background: '#f0f4ff', color: '#4350e8', border: '1px solid #c7d6ff' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Plataforma de relatórios empresariais
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Relatórios automáticos{' '}
            <span style={{ background: 'linear-gradient(135deg,#5b6ef5,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              para seu negócio
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Controle vendas, gerencie finanças e gere relatórios profissionais em PDF e Excel em segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-semibold text-white px-7 py-3.5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', boxShadow: '0 8px 24px rgba(91,110,245,0.4)' }}>
              Acessar plataforma <ArrowRight size={18} />
            </Link>
            <a href="#funcionalidades" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-semibold text-gray-700 px-7 py-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all">
              Ver funcionalidades
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500">
            {['Sem cartão de crédito', 'Setup em 2 minutos', 'Dados 100% seguros'].map(t => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} style={{ color: '#5b6ef5' }} />{t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 sm:px-6 py-10 sm:py-14" style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl sm:text-4xl font-bold text-white mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.value}</p>
              <p className="text-xs sm:text-sm text-white" style={{ opacity: 0.7 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="funcionalidades" className="px-4 sm:px-6 py-16 sm:py-24" style={{ background: '#f8fafc' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5b6ef5' }}>Funcionalidades</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Tudo que sua empresa precisa</h2>
            <p className="text-gray-500 mt-3 text-sm sm:text-base max-w-xl mx-auto">Em uma única plataforma, simples e poderosa.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: '#f0f4ff' }}>
                    <Icon size={20} style={{ color: '#4350e8' }} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5b6ef5' }}>Como funciona</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Em 3 passos simples</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              { num: '01', title: 'Faça login',        desc: 'Acesse a plataforma com suas credenciais de forma segura.' },
              { num: '02', title: 'Registre dados',    desc: 'Cadastre vendas e lançamentos financeiros facilmente.' },
              { num: '03', title: 'Gere relatórios',   desc: 'Exporte em PDF ou Excel com filtros de período.' },
            ].map((s, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="inline-flex w-12 h-12 rounded-2xl items-center justify-center text-lg font-bold mb-4 text-white"
                  style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {s.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precos" className="px-4 sm:px-6 py-16 sm:py-24" style={{ background: '#f8fafc' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#5b6ef5' }}>Preços</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Planos para todo tamanho de empresa</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {plans.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border-2 relative"
                style={{ borderColor: p.highlight ? '#5b6ef5' : '#f1f5f9', boxShadow: p.highlight ? '0 8px 30px rgba(91,110,245,0.2)' : '0 1px 3px rgba(0,0,0,0.06)' }}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-3 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)' }}>
                    Mais popular
                  </div>
                )}
                <p className="font-bold text-gray-900 text-base mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.name}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{p.price}</span>
                  <span className="text-sm text-gray-400">{p.desc}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} style={{ color: '#5b6ef5', flexShrink: 0 }} />{item}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className="block w-full text-center text-sm font-semibold py-2.5 rounded-xl transition-all"
                  style={p.highlight ? { background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', color: 'white' } : { background: '#f1f5f9', color: '#334155' }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#5b6ef5,#3640cc)' }}>
            <Zap size={24} className="text-white" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Pronto para automatizar seus relatórios?
          </h2>
          <p className="text-gray-500 mb-8 text-sm sm:text-base">Acesse agora e veja seu negócio em tempo real.</p>
          <Link href="/login" className="inline-flex items-center gap-2 text-base font-semibold text-white px-8 py-4 rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)', boxShadow: '0 8px 24px rgba(91,110,245,0.4)' }}>
            Acessar plataforma <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 sm:px-6 py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#5b6ef5,#3640cc)' }}>
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-bold text-gray-700 text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>AutoReport AI</span>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} AutoReport AI. Todos os direitos reservados.</p>
          <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Fazer login
          </Link>
        </div>
      </footer>

    </div>
  )
}