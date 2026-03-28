'use client'
// lib/usePlano.js
import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function usePlano() {
  const [plano, setPlano]     = useState('starter')
  const [ativo, setAtivo]     = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setLoading(false); return }

      const { data: perfil } = await supabase
        .from('perfis')
        .select('plano, plano_ativo, plano_expira, role')
        .eq('id', session.user.id)
        .single()

      if (perfil) {
        if (perfil.role === 'admin') {
          setPlano('business')
          setAtivo(true)
          setLoading(false)
          return
        }
        const expirou = perfil.plano_expira
          ? new Date(perfil.plano_expira) < new Date()
          : false
        setPlano(perfil.plano || 'starter')
        setAtivo(perfil.plano_ativo === true && !expirou)
      }
      setLoading(false)
    }
    carregar()
  }, [])

  const isPro      = ativo && (plano === 'pro' || plano === 'business')
  const isBusiness = ativo && plano === 'business'
  const isStarter  = !isPro

  return { plano, ativo, loading, isPro, isBusiness, isStarter }
}