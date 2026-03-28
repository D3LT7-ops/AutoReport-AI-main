// ============================================================
// lib/auth.js
// ALTERADO: Sistema migrado de localStorage demo
//           para Supabase Authentication real.
// ============================================================

import { supabase } from './supabase'

// Chave legada — mantida só para limpeza de sessões antigas
export const AUTH_KEY = 'autoreport_auth'

// ── CADASTRO ─────────────────────────────────────────────────
// NOVO: Cria usuário no Supabase + dispara email de confirmação.
// O usuário só consegue logar após clicar no link do email.
export async function cadastrar({ email, password, nome, empresa }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: nome, empresa: empresa || '' },
      emailRedirectTo: `${getAppUrl()}/auth/callback`,
    },
  })
  if (error) return { user: null, error: error.message }
  if (data.user && data.user.identities?.length === 0)
    return { user: null, error: 'Este e-mail já está cadastrado.' }
  return { user: data.user, error: null }
}

// ── LOGIN ─────────────────────────────────────────────────────
// ALTERADO: Antes comparava com DEMO_USER hardcoded no localStorage.
//           Agora autentica via Supabase com email + senha real.
export async function login(email, password) {
  clearSessionLegacy()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const msgs = {
      'Invalid login credentials': 'E-mail ou senha incorretos.',
      'Email not confirmed':       'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
      'Too many requests':         'Muitas tentativas. Aguarde alguns minutos.',
      'User not found':            'Usuário não encontrado.',
    }
    return { user: null, error: msgs[error.message] || error.message }
  }
  return { user: data.user, error: null }
}

// ── LOGOUT ────────────────────────────────────────────────────
// ALTERADO: Antes só removia do localStorage.
//           Agora encerra a sessão no Supabase.
export async function logout() {
  clearSessionLegacy()
  await supabase.auth.signOut()
}

// ── GET SESSION (síncrono) ────────────────────────────────────
// ALTERADO: Antes lia do localStorage manualmente.
//           Agora lê a sessão que o Supabase salva automaticamente.
//           Usado em componentes que precisam de acesso imediato.
export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const keys = Object.keys(localStorage)
    const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (!sbKey) return null
    const parsed = JSON.parse(localStorage.getItem(sbKey))
    const user = parsed?.user
    if (!user) return null
    return {
      email:   user.email,
      name:    user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      empresa: user.user_metadata?.empresa || '',
      id:      user.id,
    }
  } catch { return null }
}

// ── GET SESSION ASYNC ─────────────────────────────────────────
// NOVO: Versão assíncrona — use em useEffect() para sessão
//       sempre válida e atualizada.
export async function getSessionAsync() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  const user = session.user
  return {
    email:   user.email,
    name:    user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
    empresa: user.user_metadata?.empresa || '',
    id:      user.id,
  }
}

// ── RECUPERAÇÃO DE SENHA ──────────────────────────────────────
// NOVO: Envia email com link para redefinir senha.
export async function recuperarSenha(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/auth/nova-senha`,
  })
  return { error: error ? error.message : null }
}

// ── REDEFINIR SENHA ───────────────────────────────────────────
// NOVO: Chamado após o usuário clicar no link e digitar nova senha.
export async function redefinirSenha(novaSenha) {
  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  return { error: error ? error.message : null }
}

// ── HELPERS ───────────────────────────────────────────────────
function clearSessionLegacy() {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(AUTH_KEY) } catch {}
}

function getAppUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

// Mantidos para compatibilidade com código legado
export function clearSession() { clearSessionLegacy() }
export function setSession() {}