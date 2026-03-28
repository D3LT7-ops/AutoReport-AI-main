'use client'

export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-surface-700">{label}</label>
      )}
      <input
        className={`w-full px-3 py-2.5 text-sm border border-surface-200 rounded-xl bg-white placeholder:text-surface-300 transition-all ${error ? 'border-red-300 focus:border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-surface-700">{label}</label>
      )}
      <select
        className={`w-full px-3 py-2.5 text-sm border border-surface-200 rounded-xl bg-white transition-all ${error ? 'border-red-300' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
