import { supabase } from '../lib/supabase'
import { getEmpresaId } from '../lib/getEmpresaId'

const isDev = process.env.NODE_ENV === 'development'

export const financeiroService = {
  async getAll(filters = {}) {
    const empresaId = await getEmpresaId()
    let query = supabase.from('financeiro').select('*').eq('empresa_id', empresaId).order('data', { ascending: false })
    if (filters.tipo)       query = query.eq('tipo', filters.tipo)
    if (filters.dataInicio) query = query.gte('data', filters.dataInicio)
    if (filters.dataFim)    query = query.lte('data', filters.dataFim)
    const { data, error } = await query
    if (error) {
      if (isDev) { const { mockFinanceiro } = await import('../lib/mockData'); console.warn('[DEV]', error.message); return mockFinanceiro }
      throw new Error('Erro ao carregar lançamentos: ' + error.message)
    }
    if (!data?.length && isDev) { const { mockFinanceiro } = await import('../lib/mockData'); return mockFinanceiro }
    return data || []
  },

  async create(registro) {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('financeiro').insert([{ ...registro, empresa_id: empresaId }]).select().single()
    if (error) throw new Error('Erro ao criar lançamento: ' + error.message)
    return { data, error: null }
  },

  async update(id, registro) {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('financeiro').update(registro).eq('id', id).eq('empresa_id', empresaId).select().single()
    if (error) throw new Error('Erro ao atualizar lançamento: ' + error.message)
    return { data, error: null }
  },

  async delete(id) {
    const empresaId = await getEmpresaId()
    const { error } = await supabase.from('financeiro').delete().eq('id', id).eq('empresa_id', empresaId)
    if (error) throw new Error('Erro ao excluir lançamento: ' + error.message)
    return { error: null }
  },

  async getDespesasPorCategoria() {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('financeiro').select('valor, categoria').eq('empresa_id', empresaId).eq('tipo', 'despesa')
    if (error || !data?.length) {
      if (isDev) { const { mockDespesasPorCategoria } = await import('../lib/mockData'); return mockDespesasPorCategoria }
      return []
    }
    const cores = ['#5b6ef5','#06b6d4','#8b5cf6','#f59e0b','#10b981','#ef4444','#f97316']
    const por = {}
    data.forEach(i => { if (!por[i.categoria]) por[i.categoria] = 0; por[i.categoria] += Number(i.valor) })
    return Object.entries(por).map(([categoria, valor], i) => ({ categoria, valor, fill: cores[i % cores.length] }))
  },

  async getLucroMensal() {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('financeiro').select('tipo, valor, data').eq('empresa_id', empresaId)
    if (error || !data?.length) {
      if (isDev) { const { mockLucroMensal } = await import('../lib/mockData'); return mockLucroMensal }
      return []
    }
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const por = {}
    data.forEach(i => {
      const d = new Date(i.data), key = `${d.getFullYear()}-${d.getMonth()}`
      if (!por[key]) por[key] = { mes: meses[d.getMonth()], receita: 0, despesas: 0 }
      if (i.tipo === 'receita') por[key].receita += Number(i.valor)
      else por[key].despesas += Number(i.valor)
    })
    return Object.values(por).map(m => ({ ...m, lucro: m.receita - m.despesas })).slice(-8)
  },

  async getSummary() {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('financeiro').select('tipo, valor, data').eq('empresa_id', empresaId)
    if (error || !data?.length) return { totalReceitas: 0, totalDespesas: 0, saldo: 0, receitaMes: 0, despesasMes: 0 }
    const now = new Date()
    const totalReceitas = data.filter(i => i.tipo === 'receita').reduce((s,i) => s + Number(i.valor), 0)
    const totalDespesas = data.filter(i => i.tipo === 'despesa').reduce((s,i) => s + Number(i.valor), 0)
    const mes = data.filter(i => { const d = new Date(i.data); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() })
    return {
      totalReceitas, totalDespesas, saldo: totalReceitas - totalDespesas,
      receitaMes:  mes.filter(i => i.tipo === 'receita').reduce((s,i) => s + Number(i.valor), 0),
      despesasMes: mes.filter(i => i.tipo === 'despesa').reduce((s,i) => s + Number(i.valor), 0),
    }
  },
}
