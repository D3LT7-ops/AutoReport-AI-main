// ============================================================
// components/AuthGuard.js
// ALTERADO: Antes usava getSession() síncrono do localStorage.
//           Agora usa getSessionAsync() do Supabase + escuta
//           mudanças de sessão em tempo real (onAuthStateChange).
// ============================================================
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { Zap } from 'lucide-react'

export default function AuthGuard({ children }) {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // NOVO: Verifica sessão ativa no Supabase ao montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setChecked(true)
      }
    })

    // NOVO: Escuta mudanças de sessão em tempo real.
    // Se o usuário fizer logout em outra aba, redireciona automaticamente.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login')
      }
      if (event === 'SIGNED_IN' && session) {
        setChecked(true)
      }
    })

    // Cleanup: remove o listener ao desmontar
    return () => subscription.unsubscribe()
  }, [router])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#5b6ef5,#4350e8)' }}>
            <Zap className="text-white" size={22} />
          </div>
          <div className="w-5 h-5 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return children
}