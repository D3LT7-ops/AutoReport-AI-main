import { supabase } from './supabase'

let _cache = null
let _userId = null

export async function getEmpresaId() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Usuário não autenticado.')

  if (_userId !== session.user.id) { _cache = null; _userId = session.user.id }
  if (_cache) return _cache

  const { data: perfil, error } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', session.user.id)
    .single()

  if (error || !perfil?.empresa_id) throw new Error('Perfil não encontrado.')
  _cache = perfil.empresa_id
  return _cache
}

export function clearEmpresaCache() { _cache = null; _userId = null }
