'use client'

import { Loader2 } from 'lucide-react'

export default function Button({ children, variant = 'primary', size = 'md', loading, icon: Icon, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md active:scale-[0.98]',
    secondary: 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50 hover:border-surface-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'text-surface-600 hover:bg-surface-100 hover:text-surface-800',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} /> : null}
      {children}
    </button>
  )
}
