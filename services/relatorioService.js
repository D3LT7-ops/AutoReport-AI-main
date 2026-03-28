import { supabase } from '../lib/supabase'
import { getEmpresaId } from '../lib/getEmpresaId'
import { vendasService } from './vendasService'
import { financeiroService } from './financeiroService'

export const relatorioService = {
  async getRelatorioVendas(dataInicio, dataFim) {
    const vendas = await vendasService.getAll({ dataInicio, dataFim })
    const total  = vendas.reduce((s, v) => s + Number(v.valor), 0)
    return { tipo: 'vendas', periodo: { inicio: dataInicio, fim: dataFim }, dados: vendas,
      resumo: { 'Total de Vendas': total, 'Quantidade': vendas.length, 'Ticket Médio': vendas.length ? total / vendas.length : 0,
        'Maior Venda': vendas.reduce((m, v) => Math.max(m, Number(v.valor)), 0) } }
  },

  async getRelatorioFinanceiro(dataInicio, dataFim) {
    const registros = await financeiroService.getAll({ dataInicio, dataFim })
    const rec  = registros.filter(r => r.tipo === 'receita').reduce((s,r) => s + Number(r.valor), 0)
    const desp = registros.filter(r => r.tipo === 'despesa').reduce((s,r) => s + Number(r.valor), 0)
    return { tipo: 'financeiro', periodo: { inicio: dataInicio, fim: dataFim }, dados: registros,
      resumo: { 'Total de Receitas': rec, 'Total de Despesas': desp, 'Lucro Líquido': rec - desp,
        'Margem (%)': rec > 0 ? ((rec - desp) / rec * 100).toFixed(1) + '%' : '0%' } }
  },

  async getFluxoCaixa(dataInicio, dataFim) {
    const registros = await financeiroService.getAll({ dataInicio, dataFim })
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const fluxo = {}
    registros.forEach(i => {
      const d = new Date(i.data), key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      if (!fluxo[key]) fluxo[key] = { mes: `${meses[d.getMonth()]}/${d.getFullYear()}`, entradas: 0, saidas: 0 }
      if (i.tipo === 'receita') fluxo[key].entradas += Number(i.valor)
      else fluxo[key].saidas += Number(i.valor)
    })
    let saldo = 0
    const dados = Object.entries(fluxo).sort(([a],[b]) => a.localeCompare(b)).map(([,m]) => {
      saldo += m.entradas - m.saidas; return { ...m, saldo: m.entradas - m.saidas, saldoAcumulado: saldo }
    })
    return { tipo: 'fluxo_caixa', periodo: { inicio: dataInicio, fim: dataFim }, dados }
  },

  async getDesempenhoMensal(ano = new Date().getFullYear()) {
    const [vendas, fin] = await Promise.all([
      vendasService.getAll({ dataInicio: `${ano}-01-01`, dataFim: `${ano}-12-31` }),
      financeiroService.getAll({ dataInicio: `${ano}-01-01`, dataFim: `${ano}-12-31` }),
    ])
    const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const dados = meses.map((mes, i) => {
      const mv = vendas.filter(v => new Date(v.data).getMonth() === i)
      const rec  = fin.filter(f => f.tipo === 'receita' && new Date(f.data).getMonth() === i).reduce((s,f) => s + Number(f.valor), 0)
      const desp = fin.filter(f => f.tipo === 'despesa' && new Date(f.data).getMonth() === i).reduce((s,f) => s + Number(f.valor), 0)
      return { mes, qtdVendas: mv.length, totalVendas: mv.reduce((s,v) => s + Number(v.valor), 0), receita: rec, despesas: desp, lucro: rec - desp }
    })
    return { tipo: 'desempenho_mensal', periodo: { inicio: `${ano}-01-01`, fim: `${ano}-12-31` }, ano, dados }
  },

  async saveRelatorio(relatorio) {
    const empresaId = await getEmpresaId()
    const { data, error } = await supabase.from('relatorios').insert([{
      empresa_id: empresaId, tipo: relatorio.tipo,
      periodo_inicio: relatorio.periodo?.inicio, periodo_fim: relatorio.periodo?.fim,
    }]).select().single()
    if (error) throw new Error('Erro ao salvar relatório: ' + error.message)
    return { data, error: null }
  },
}
