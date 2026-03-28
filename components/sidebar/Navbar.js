'use client'

import { Bell, Search, HelpCircle } from 'lucide-react'

export default function Navbar({ title, subtitle }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <header className="bg-white border-b border-surface-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="font-display font-bold text-surface-900 text-xl">{title}</h2>
        {subtitle && <p className="text-sm text-surface-400 mt-0.5">{subtitle || dateStr}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-surface-300" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-9 pr-4 py-2 text-sm bg-surface-50 border border-surface-100 rounded-lg focus:bg-white w-48 transition-all duration-200"
          />
        </div>

        {/* Help */}
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-50 transition-colors">
          <HelpCircle className="w-4.5 h-4.5 text-surface-400" size={18} />
        </button>

        {/* Notifications */}
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-50 transition-colors relative">
          <Bell className="w-4.5 h-4.5 text-surface-400" size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Date pill */}
        <div className="hidden lg:flex items-center gap-2 ml-2 bg-surface-50 border border-surface-100 rounded-lg px-3 py-2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-surface-500 capitalize">{dateStr}</span>
        </div>
      </div>
    </header>
  )
}
