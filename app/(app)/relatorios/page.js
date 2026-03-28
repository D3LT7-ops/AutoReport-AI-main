'use client'
// ============================================================
// app/(app)/relatorios/page.js
// Exportação Excel é exclusiva do plano Pro+.
// PDF está disponível para todos.
// PlanoGuard bloqueia o acesso à exportação Excel
// se o usuário não tiver plano pago.
// ============================================================

import { useState } from 'react'
import Navbar from '../../../components/sidebar/Navbar'
import PlanoGuard from '../../../components/PlanoGuard'
import { usePlano } from '../../../lib/usePlano'
import { relatorioService } from '../../../services/relatorioService'
import { formatCurrency, formatDate } from '../../../lib/formatters'
import {
  FileBarChart, FileText, TrendingUp, Calendar,
  Download, FileSpreadsheet, CheckCircle, Lock, Crown
} from 'lucide-react'

const tipos = [
  { id: 'vendas',            label: 'Vendas',         icon: TrendingUp,   desc: 'Histórico de vendas',  color:'#4350e8', bg:'#f0f4ff' },
  { id: 'financeiro',        label: 'Financeiro',     icon: FileText,     desc: 'Receitas e despesas',  color:'#059669', bg:'#ecfdf5' },
  { id: 'fluxo_caixa',       label: 'Fluxo de Caixa', icon: Calendar,     desc: 'Entradas e saídas',    color:'#7c3aed', bg:'#f5f3ff' },
  { id: 'desempenho_mensal', label: 'Desempenho',     icon: FileBarChart, desc: 'Análise mensal',       color:'#d97706', bg:'#fffbeb' },
]

// ── Conteúdo real da página ──────────────────────────────────
function RelatoriosConteudo() {
  const today       = new Date().toISOString().split('T')[0]
  const firstOfYear = `${new Date().getFullYear()}-01-01`

  const { isPro, isStarter } = usePlano()

  const [selectedTipo, setSelectedTipo] = useState('vendas')
  const [dataInicio, setDataInicio]     = useState(firstOfYear)
  const [dataFim, setDataFim]           = useState(today)
  const [loading, setLoading]           = useState(false)
  const [exportType, setExportType]     = useState(null)
  const [lastGen, setLastGen]           = useState(null)

  async function gerar(formato) {
    setLoading(true)
    setExportType(formato)
    try {
      let rel
      if (selectedTipo === 'vendas')            rel = await relatorioService.getRelatorioVendas(dataInicio, dataFim)
      else if (selectedTipo === 'financeiro')   rel = await relatorioService.getRelatorioFinanceiro(dataInicio, dataFim)
      else if (selectedTipo === 'fluxo_caixa') rel = await relatorioService.getFluxoCaixa(dataInicio, dataFim)
      else                                      rel = await relatorioService.getDesempenhoMensal(new Date().getFullYear())

      if (formato === 'pdf') await exportPDF(rel)
      else await exportExcel(rel)
      setLastGen({ tipo: selectedTipo, formato, time: new Date() })
    } catch (e) {
      alert('Erro: ' + e.message)
    } finally {
      setLoading(false)
      setExportType(null)
    }
  }

  async function exportPDF(rel) {
    const { default: jsPDF }       = await import('jspdf')
    const { default: autoTable }   = await import('jspdf-autotable')
    const doc = new jsPDF()
    const label = tipos.find(t => t.id === rel.tipo)?.label || rel.tipo

    doc.setFillColor(67, 80, 232)
    doc.rect(0, 0, 210, 38, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('AutoReport AI', 14, 16)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(label, 14, 26)
    doc.setFontSize(8)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 34)
    doc.setTextColor(30, 41, 59)

    let y = 50
    if (rel.resumo) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumo', 14, y)
      y += 8
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      Object.entries(rel.resumo).forEach(([k, v]) => {
        doc.text(`${k}: ${typeof v === 'number' ? formatCurrency(v) : v}`, 14, y)
        y += 6
      })
      y += 4
    }

    if (rel.dados?.length > 0) {
      const keys = Object.keys(rel.dados[0]).filter(k => !['id', 'empresa_id'].includes(k))
      autoTable(doc, {
        startY: y,
        head:   [keys.map(k => k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))],
        body:   rel.dados.map(row => keys.map(k => {
          const v = row[k]
          if (k === 'data') return formatDate(v)
          if (typeof v === 'number') return formatCurrency(v)
          return v ?? '-'
        })),
        styles:      { fontSize: 8, cellPadding: 2.5 },
        headStyles:  { fillColor: [67, 80, 232], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin:      { left: 14, right: 14 },
      })
    }

    const pages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.text(`AutoReport AI — Pág ${i}/${pages}`, 105, 287, { align: 'center' })
    }
    doc.save(`relatorio_${rel.tipo}_${today}.pdf`)
  }

  async function exportExcel(rel) {
    const XLSX  = await import('xlsx')
    const wb    = XLSX.utils.book_new()
    const label = tipos.find(t => t.id === rel.tipo)?.label || rel.tipo

    if (rel.resumo) {
      const ws1 = XLSX.utils.aoa_to_sheet([
        ['AutoReport AI — ' + label],
        ['Gerado em:', new Date().toLocaleString('pt-BR')],
        [],
        ['RESUMO'],
        ...Object.entries(rel.resumo).map(([k, v]) => [k, v])
      ])
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumo')
    }

    if (rel.dados?.length > 0) {
      const keys = Object.keys(rel.dados[0]).filter(k => !['id', 'empresa_id'].includes(k))
      const ws2  = XLSX.utils.aoa_to_sheet([
        keys.map(k => k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
        ...rel.dados.map(row => keys.map(k => {
          const v = row[k]
          if (k === 'data') return formatDate(v)
          return v ?? ''
        }))
      ])
      XLSX.utils.book_append_sheet(wb, ws2, 'Dados')
    }

    XLSX.writeFile(wb, `relatorio_${rel.tipo}_${today}.xlsx`)
  }

  const selected = tipos.find(t => t.id === selectedTipo)

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

      {/* Seletor de tipo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tipos.map(t => {
          const Icon   = t.icon
          const active = selectedTipo === t.id
          return (
            <button key={t.id} onClick={() => setSelectedTipo(t.id)}
              className="text-left p-3 sm:p-4 rounded-2xl border-2 transition-all"
              style={active
                ? { background: t.bg, borderColor: t.color + '66', boxShadow: `0 4px 16px ${t.color}22` }
                : { background: 'white', borderColor: '#f1f5f9' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2 sm:mb-3" style={{ background: t.bg }}>
                <Icon size={17} style={{ color: t.color }} />
              </div>
              <p className="font-bold text-gray-900 text-xs sm:text-sm leading-tight">{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{t.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Configuração */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Configurar Relatório
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Data Inicial</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Data Final</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-400" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Relatório</label>
            <div className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-medium">
              {selected?.label}
            </div>
          </div>
        </div>

        {/* Botões de exportação */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* PDF — disponível para todos */}
          <button onClick={() => gerar('pdf')} disabled={loading}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold text-white py-2.5 px-5 rounded-xl disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
            {loading && exportType === 'pdf'
              ? <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Gerando...</>
              : <><Download size={15} />Exportar PDF</>
            }
          </button>

          {/* Excel — exclusivo plano Pro+ */}
          {isPro ? (
            <button onClick={() => gerar('excel')} disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold text-white py-2.5 px-5 rounded-xl disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
              {loading && exportType === 'excel'
                ? <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />Gerando...</>
                : <><FileSpreadsheet size={15} />Exportar Excel</>
              }
            </button>
          ) : (
            // Botão bloqueado com CTA de upgrade
            <button onClick={() => window.location.href = '/planos'}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-5 rounded-xl border-2 border-dashed transition-all hover:border-indigo-400 hover:bg-indigo-50"
              style={{ borderColor: '#c7d6ff', color: '#4350e8' }}>
              <Lock size={14} />
              Excel — Plano Pro
              <Crown size={13} />
            </button>
          )}
        </div>

        {/* Aviso de plano para usuários starter */}
        {isStarter && (
          <div className="mt-3 flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl">
            <Crown size={13} />
            Exportação Excel disponível no Plano Pro.
            <button onClick={() => window.location.href = '/planos'} className="font-bold underline">
              Fazer upgrade
            </button>
          </div>
        )}
      </div>

      {/* Sucesso */}
      {lastGen && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#166534' }}>Relatório gerado!</p>
            <p className="text-xs" style={{ color: '#15803d' }}>
              {tipos.find(t => t.id === lastGen.tipo)?.label} em {lastGen.formato.toUpperCase()} — {lastGen.time.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Página exportada ─────────────────────────────────────────
export default function RelatoriosPage() {
  return (
    <div>
      <Navbar title="Relatórios" subtitle="Gere e exporte relatórios automáticos" />
      <RelatoriosConteudo />
    </div>
  )
}