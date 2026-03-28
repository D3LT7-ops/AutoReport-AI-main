// ============================================================
// lib/supabase.js
// ALTERADO: Adicionadas opções de persistência de sessão e
//           detecção automática de sessão via URL (para o
//           callback de confirmação de email funcionar).
// ============================================================
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase: variáveis de ambiente não configuradas.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // NOVO: persiste sessão no localStorage automaticamente
    persistSession: true,
    // NOVO: detecta tokens na URL (necessário para links de
    //       confirmação de email e recuperação de senha)
    detectSessionInUrl: true,
    // NOVO: atualiza o token automaticamente antes de expirar
    autoRefreshToken: true,
  },
})