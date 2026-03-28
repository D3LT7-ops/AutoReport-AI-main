import { supabase } from '../lib/supabase'
import { getEmpresaId } from '../lib/getEmpresaId'

const isDev = process.env.NODE_ENV === 'development'

export const vendasService = {
  async getAll(filters = {}) {
    const empresaId = await getEmpresaId()
    let query = supabase.from('vendas').select('*').eq('empresa_id', empresaId).order('data', { ascending: false })
    if (filters.dataInicio) query = query.gte('data', filters.dataInicio)
    if (filters.dataFim)    query = query.lte('data', filters.dataFim)
    const { data, error } = await query
    if (error) {
      if (isDev) { const { mockVendas } = await import('../lib/mockData'); console.warn('[DEV]', error.message); return mockVendas }
      throw new Error('Erro ao carregar vendas: ' + error.message)
    }
    if (!data?.length && isDev) { const { mockVendas } = await import('../lib/mockData'); return mockVendas }
    return data || []
  },

  async create(venda) {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('vendas').insert([{ ...venda, empresa_id: empresaId }]).select().single()
    if (error) throw new Error('Erro ao criar venda: ' + error.message)
    return { data, error: null }
  },

  async update(id, venda) {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('vendas').update(venda).eq('id', id).eq('empresa_id', empresaId).select().single()
    if (error) throw new Error('Erro ao atualizar venda: ' + error.message)
    return { data, error: null }
  },

  async delete(id) {
    const empresaId = await getEmpresaId()
    const { error } = await supabase.from('vendas').delete().eq('id', id).eq('empresa_id', empresaId)
    if (error) throw new Error('Erro ao excluir venda: ' + error.message)
    return { error: null }
  },

  async getVendasPorMes() {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('vendas').select('valor, data').eq('empresa_id', empresaId)
    if (error || !data?.length) {
      if (isDev) { const { mockVendasPorMes } = await import('../lib/mockData'); return mockVendasPorMes }
      return []
    }
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const porMes = {}
    data.forEach(v => {
      const d = new Date(v.data), key = `${d.getFullYear()}-${d.getMonth()}`
      if (!porMes[key]) porMes[key] = { mes: meses[d.getMonth()], vendas: 0, meta: 20000 }
      porMes[key].vendas += Number(v.valor)
    })
    return Object.values(porMes).slice(-8)
  },

  async getTotalVendas() {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('vendas').select('valor').eq('empresa_id', empresaId)
    if (error || !data) return 0
    return data.reduce((s, v) => s + Number(v.valor), 0)
  },
}
