'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, ShoppingCart, DollarSign, FileBarChart, Settings, Zap, ChevronRight, LogOut, X, Menu, Crown } from 'lucide-react'

// ALTERADO: importa logout() assíncrono do Supabase
// Removido clearSession() legado que só apagava localStorage
import { logout, getSession, getSessionAsync } from '../../lib/auth'

const navItems = [
  { href: '/dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/vendas',        label: 'Vendas',        icon: ShoppingCart },
  { href: '/financeiro',    label: 'Financeiro',    icon: DollarSign },
  { href: '/relatorios',    label: 'Relatórios',    icon: FileBarChart },
  { href: '/planos',        label: 'Planos',        icon: Crown },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function SidebarContent({ onClose }) {
  const pathname = usePathname()
  const router   = useRouter()

  // ALTERADO: session carregada via Supabase de forma assíncrona
  // getSession() síncrono usado como fallback inicial
  const [session, setSession] = useState(getSession())

  useEffect(() => {
    // NOVO: atualiza session com dados reais do Supabase
    getSessionAsync().then(s => { if (s) setSession(s) })
  }, [])

  // ALTERADO: logout agora chama supabase.auth.signOut()
  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
            style={{background:'linear-gradient(135deg,#5b6ef5,#3640cc)'}}>
            <Zap className="text-white" size={18} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none"
              style={{fontFamily:'Plus Jakarta Sans,sans-serif'}}>AutoReport AI</p>
            <span className="text-xs font-medium" style={{color:'#5b6ef5'}}>AI PLATFORM</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">Menu Principal</p>
        {navItems.map((item) => {
          const Icon     = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1"
              style={isActive
                ? { background:'linear-gradient(135deg,#5b6ef5,#6366f1)', color:'white', boxShadow:'0 4px 14px rgba(91,110,245,0.4)' }
                : { color:'#475569' }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={18} style={isActive ? {color:'white'} : {color:'#94a3b8'}} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} style={{color:'rgba(255,255,255,0.7)'}} />}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="rounded-xl p-3 mb-3"
          style={{background:'linear-gradient(135deg,#f0f4ff,#f5f3ff)'}}>
          <p className="text-xs font-semibold mb-0.5" style={{color:'#4350e8'}}>Plano Pro Ativo</p>
          <p className="text-xs" style={{color:'#64748b'}}>Relatórios ilimitados disponíveis.</p>
        </div>

        {/* ALTERADO: exibe nome/email vindos do Supabase */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{background:'linear-gradient(135deg,#7b91ff,#8b5cf6)'}}>
            {session?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{session?.name || 'Usuário'}</p>
            <p className="text-xs text-gray-400 truncate">{session?.email || ''}</p>
          </div>
          {/* ALTERADO: chama logout() assíncrono do Supabase */}
          <button onClick={handleLogout} title="Sair"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors group">
            <LogOut size={15} className="text-gray-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm"
      >
        <Menu size={18} className="text-gray-600" />
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-40"
          onClick={() => setMobileOpen(false)} />
      )}

      <div className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </div>

      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  )
}