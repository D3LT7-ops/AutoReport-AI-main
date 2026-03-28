'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'

export default function AdminGuard({ children }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token')

    if (!token) {
      router.replace('/admin/login')
      return
    }

    // Verifica expiração local (8h) sem precisar de fetch
    const [ts] = token.split('.')
    const expirou = Date.now() - parseInt(ts) > 8 * 60 * 60 * 1000

    if (expirou) {
      sessionStorage.removeItem('admin_token')
      router.replace('/admin/login')
      return
    }

    // Token existe e não expirou — libera acesso
    setOk(true)
  }, [router])

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
            <Shield className="text-white" size={22} />
          </div>
          <div className="w-5 h-5 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  return children
}