'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../../components/sidebar/Navbar'
import StatsCard from '../../../components/cards/StatsCard'
import { VendasPorMesChart, DespesasPorCategoriaChart, LucroMensalChart, CrescimentoChart } from '../../../components/charts/Charts'
import { vendasService } from '../../../services/vendasService'
import { financeiroService } from '../../../services/financeiroService'
import { mockDashboardStats, mockVendasPorMes, mockDespesasPorCategoria, mockLucroMensal, mockCrescimentoReceita } from '../../../lib/mockData'
import { formatCurrency } from '../../../lib/formatters'
import { ArrowUpRight } from 'lucide-react'

const buildCards = (stats) => [
  { title: 'Total de Vendas',   value: formatCurrency(stats.totalVendas),   change: '+12.5%', changeLabel: 'vs. mês anterior', iconName: 'ShoppingCart', color: 'brand',  trend: 'up' },
  { title: 'Receita do Mês',    value: formatCurrency(stats.receitaMes),    change: '+8.2%',  changeLabel: 'vs. mês anterior', iconName: 'DollarSign',  color: 'green',  trend: 'up' },
  { title: 'Total de Despesas', value: formatCurrency(stats.totalDespesas), change: '-3.1%',  changeLabel: 'vs. mês anterior', iconName: 'TrendingDown',color: 'red',    trend: 'down' },
  { title: 'Lucro Líquido',     value: formatCurrency(stats.lucroLiquido),  change: '+19.7%', changeLabel: 'vs. mês anterior', iconName: 'TrendingUp', color: 'purple', trend: 'up' },
]

export default function DashboardPage() {
  const [stats, setStats]                 = useState(mockDashboardStats)
  const [vendasMes, setVendasMes]         = useState(mockVendasPorMes)
  const [despCat, setDespCat]             = useState(mockDespesasPorCategoria)
  const [lucro, setLucro]                 = useState(mockLucroMensal)
  const [crescimento, setCrescimento]     = useState(mockCrescimentoReceita)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [tv, fin, vm, dc, lm] = await Promise.all([
          vendasService.getTotalVendas(),
          financeiroService.getSummary(),
          vendasService.getVendasPorMes(),
          financeiroService.getDespesasPorCategoria(),
          financeiroService.getLucroMensal(),
        ])
        if (tv > 0 || fin.totalReceitas > 0) {
          setStats({ totalVendas: tv || mockDashboardStats.totalVendas, receitaMes: fin.receitaMes || mockDashboardStats.receitaMes, totalDespesas: fin.totalDespesas || mockDashboardStats.totalDespesas, lucroLiquido: fin.saldo || mockDashboardStats.lucroLiquido })
        }
        if (vm?.length)  setVendasMes(vm)
        if (dc?.length)  setDespCat(dc)
        if (lm?.length) {
          setLucro(lm)
          setCrescimento(lm.map((m, i) => {
            const prev = i > 0 ? lm[i-1].receita : m.receita
            return { mes: m.mes, crescimento: prev > 0 ? parseFloat(((m.receita - prev) / prev * 100).toFixed(1)) : 0 }
          }))
        }
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const Skeleton = ({ h = 'h-64' }) => <div className={`${h} rounded-xl animate-pulse`} style={{background:'#f1f5f9'}} />

  return (
    <div>
      <Navbar title="Dashboard" subtitle="Visão geral do seu negócio" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Stats Cards — 1 col mobile, 2 tablet, 4 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {buildCards(stats).map((c, i) => <StatsCard key={i} {...c} />)}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 sm:p-5" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base" style={{fontFamily:'Plus Jakarta Sans,sans-serif'}}>Vendas por Mês</h3>
                <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Comparativo com meta mensal</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{background:'#f0f4ff',color:'#4350e8'}}>
                <ArrowUpRight size={12} /> 2024
              </span>
            </div>
            {loading ? <Skeleton h="h-52 sm:h-64" /> : <VendasPorMesChart data={vendasMes} />}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1" style={{fontFamily:'Plus Jakarta Sans,sans-serif'}}>Despesas por Categoria</h3>
            <p className="text-xs text-gray-400 mb-4 hidden sm:block">Distribuição do período</p>
            {loading ? <Skeleton h="h-52 sm:h-64" /> : <DespesasPorCategoriaChart data={despCat} />}
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1" style={{fontFamily:'Plus Jakarta Sans,sans-serif'}}>Lucro Mensal</h3>
            <p className="text-xs text-gray-400 mb-4 hidden sm:block">Receitas, despesas e lucro</p>
            {loading ? <Skeleton h="h-48 sm:h-56" /> : <LucroMensalChart data={lucro} />}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1" style={{fontFamily:'Plus Jakarta Sans,sans-serif'}}>Crescimento da Receita</h3>
            <p className="text-xs text-gray-400 mb-4 hidden sm:block">Variação percentual mensal</p>
            {loading ? <Skeleton h="h-48 sm:h-56" /> : <CrescimentoChart data={crescimento} />}
          </div>
        </div>

      </div>
    </div>
  )
}
