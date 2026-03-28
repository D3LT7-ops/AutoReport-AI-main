'use client'

import { TrendingUp, TrendingDown, Minus, DollarSign, ShoppingCart } from 'lucide-react'

const iconMap = {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
}

const colorMap = {
  brand: { icon: 'bg-brand-100 text-brand-600' },
  green: { icon: 'bg-emerald-100 text-emerald-600' },
  red: { icon: 'bg-red-100 text-red-600' },
  purple: { icon: 'bg-purple-100 text-purple-600' },
  amber: { icon: 'bg-amber-100 text-amber-600' },
}

export default function StatsCard({ title, value, change, changeLabel, iconName, color = 'brand', trend }) {
  const colors = colorMap[color] || colorMap.brand
  const isPositive = trend === 'up'
  const isNegative = trend === 'down'
  const Icon = iconMap[iconName] || DollarSign

  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-5 card-hover shadow-card animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${colors.icon} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-600' :
            isNegative ? 'bg-red-50 text-red-500' :
            'bg-surface-100 text-surface-500'
          }`}>
            {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-surface-500 font-medium mb-1">{title}</p>
        <p className="text-2xl font-display font-bold text-surface-900 leading-none">{value}</p>
        {changeLabel && <p className="text-xs text-surface-400 mt-1.5">{changeLabel}</p>}
      </div>
    </div>
  )
}