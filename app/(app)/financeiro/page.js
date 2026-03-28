'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../../components/sidebar/Navbar'
import { financeiroService } from '../../../services/financeiroService'
import { formatCurrency, formatDate } from '../../../lib/formatters'
import { Plus, Pencil, Trash2, Search, TrendingUp, TrendingDown, Wallet, X, Loader2 } from 'lucide-react'

const cats = { receita: ['Vendas','Consultoria','Licenças','Serviços','Outros'], despesa: ['Salários','Marketing','Infraestrutura','Administrativo','Fornecedores','Impostos','Outros'] }
const emptyForm = { tipo: 'receita', valor: '', categoria: 'Vendas', descricao: '', data: new Date().toISOString().split('T')[0] }
const cls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"

function Modal({ open, onClose, title, children }) {
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900" style={{fontFamily:'Plus Jakarta Sans,sans-serif'}}>{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"><X size={16} className="text-gray-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

export default function FinanceiroPage() {
  const [registros, setRegistros] = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [errors, setErrors]       = useState({})
  const [filterTipo, setFilterTipo] = useState('')
  const [search, setSearch]       = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setRegistros(await financeiroService.getAll())
    setLoading(false)
  }

  function openCreate() { setEditItem(null); setForm(emptyForm); setErrors({}); setModalOpen(true) }
  function openEdit(r) { setEditItem(r); setForm({ tipo: r.tipo, valor: String(r.valor), categoria: r.categoria, descricao: r.descricao||'', data: r.data?.split('T')[0]||r.data }); setErrors({}); setModalOpen(true) }

  function validate() {
    const e = {}
    if (!form.valor || isNaN(form.valor) || Number(form.valor) <= 0) e.valor = 'Valor inválido'
    if (!form.data) e.data = 'Obrigatório'
    setErrors(e); return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    const payload = { tipo: form.tipo, valor: parseFloat(form.valor), categoria: form.categoria, descricao: form.descricao, data: form.data }
    if (editItem) {
      await financeiroService.update(editItem.id, payload)
      setRegistros(prev => prev.map(r => r.id === editItem.id ? { ...r, ...payload } : r))
    } else {
      const { data } = await financeiroService.create(payload)
      setRegistros(prev => [data || { id: Date.now(), ...payload }, ...prev])
    }
    setModalOpen(false); setSaving(false)
  }

  async function handleDelete() {
    await financeiroService.delete(deleteItem.id)
    setRegistros(prev => prev.filter(r => r.id !== deleteItem.id))
    setDeleteItem(null)
  }

  const filtered = registros.filter(r => {
    const mt = !filterTipo || r.tipo === filterTipo
    const ms = !search || r.descricao?.toLowerCase().includes(search.toLowerCase()) || r.categoria?.toLowerCase().includes(search.toLowerCase())
    return mt && ms
  })

  const totalRec = registros.filter(r => r.tipo==='receita').reduce((s,r)=>s+Number(r.valor),0)
  const totalDesp = registros.filter(r => r.tipo==='despesa').reduce((s,r)=>s+Number(r.valor),0)
  const saldo = totalRec - totalDesp

  return (
    <div>
      <Navbar title="Financeiro" subtitle="Controle de receitas e despesas" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: TrendingUp,   label: 'Receitas', value: formatCurrency(totalRec),  color:'#059669', bg:'#ecfdf5' },
            { icon: TrendingDown, label: 'Despesas', value: formatCurrency(totalDesp), color:'#ef4444', bg:'#fef2f2' },
            { icon: Wallet,       label: 'Saldo',    value: formatCurrency(saldo),     color: saldo>=0?'#4350e8':'#ef4444', bg: saldo>=0?'#f0f4ff':'#fef2f2' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:c.bg}}>
                <c.icon size={16} style={{color:c.color}} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="font-bold text-sm sm:text-base truncate" style={{color:c.color}}>{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900" style={{fontFamily:'Plus Jakarta Sans,sans-serif'}}>Lançamentos</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-400 w-full sm:w-36" />
              </div>
              <select value={filterTipo} onChange={e=>setFilterTipo(e.target.value)} className="text-sm border border-gray-200 rounded-xl bg-gray-50 px-3 py-2 focus:outline-none">
                <option value="">Todos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
              <button onClick={openCreate} className="flex items-center gap-1.5 text-sm font-medium text-white px-3 sm:px-4 py-2 rounded-xl whitespace-nowrap" style={{background:'linear-gradient(135deg,#5b6ef5,#4350e8)'}}>
                <Plus size={15} /><span className="hidden sm:inline">Novo Lançamento</span><span className="sm:hidden">Novo</span>
              </button>
            </div>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-gray-50">
            {loading ? [...Array(4)].map((_,i)=><div key={i} className="p-4"><div className="h-14 rounded-xl animate-pulse" style={{background:'#f1f5f9'}} /></div>)
            : filtered.length===0 ? <div className="py-12 text-center text-sm text-gray-400">Nenhum lançamento encontrado</div>
            : filtered.map(r => (
              <div key={r.id} className="p-4 flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${r.tipo==='receita'?'text-green-700':'text-red-600'}`}
                  style={{background: r.tipo==='receita'?'#dcfce7':'#fee2e2'}}>
                  {r.tipo==='receita'?<TrendingUp size={10}/>:<TrendingDown size={10}/>}
                  {r.tipo==='receita'?'Rec':'Desp'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.categoria}</p>
                  <p className="text-xs text-gray-500 truncate">{r.descricao||formatDate(r.data)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold" style={{color: r.tipo==='receita'?'#059669':'#ef4444'}}>{formatCurrency(r.valor)}</span>
                  <button onClick={()=>openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'#f0f4ff'}}><Pencil size={12} style={{color:'#4350e8'}} /></button>
                  <button onClick={()=>setDeleteItem(r)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'#fef2f2'}}><Trash2 size={12} style={{color:'#ef4444'}} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Tipo','Categoria','Descrição','Valor','Data','Ações'].map(h=>(
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_,i)=>(
                  <tr key={i}>{[...Array(6)].map((_,j)=><td key={j} className="px-5 py-4"><div className="h-4 rounded animate-pulse w-20" style={{background:'#f1f5f9'}} /></td>)}</tr>
                )) : filtered.length===0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-sm text-gray-400">Nenhum lançamento encontrado</td></tr>
                ) : filtered.map(r=>(
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${r.tipo==='receita'?'text-green-700':'text-red-600'}`}
                        style={{background:r.tipo==='receita'?'#dcfce7':'#fee2e2'}}>
                        {r.tipo==='receita'?<TrendingUp size={10}/>:<TrendingDown size={10}/>}
                        {r.tipo==='receita'?'Receita':'Despesa'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{r.categoria}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{r.descricao||'-'}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{color:r.tipo==='receita'?'#059669':'#ef4444'}}>{r.tipo==='despesa'?'-':''}{formatCurrency(r.valor)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(r.data)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={()=>openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-indigo-50"><Pencil size={13} className="text-gray-400" /></button>
                        <button onClick={()=>setDeleteItem(r)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50"><Trash2 size={13} className="text-gray-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading&&filtered.length>0&&<div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} registro(s)</div>}
        </div>
      </div>

      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editItem?'Editar Lançamento':'Novo Lançamento'}>
        <div className="space-y-4">
          <div className="flex gap-2">
            {['receita','despesa'].map(t=>(
              <button key={t} onClick={()=>setForm({...form,tipo:t,categoria:cats[t][0]})}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all"
                style={form.tipo===t?{background:t==='receita'?'#ecfdf5':'#fef2f2',borderColor:t==='receita'?'#86efac':'#fca5a5',color:t==='receita'?'#166534':'#991b1b'}:{borderColor:'#e5e7eb',color:'#6b7280'}}>
                {t==='receita'?'Receita':'Despesa'}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Categoria</label>
            <select className={cls} value={form.categoria} onChange={e=>setForm({...form,categoria:e.target.value})}>
              {cats[form.tipo].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Valor (R$)</label>
            <input className={cls} type="number" step="0.01" min="0" placeholder="0,00" value={form.valor} onChange={e=>setForm({...form,valor:e.target.value})} />
            {errors.valor&&<p className="text-xs text-red-500">{errors.valor}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Descrição (opcional)</label>
            <input className={cls} placeholder="Descreva o lançamento..." value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Data</label>
            <input className={cls} type="date" value={form.data} onChange={e=>setForm({...form,data:e.target.value})} />
            {errors.data&&<p className="text-xs text-red-500">{errors.data}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={()=>setModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-medium text-white rounded-xl flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg,#5b6ef5,#4350e8)'}}>
              {saving?<><Loader2 size={14} className="animate-spin"/>Salvando...</>:editItem?'Salvar':'Cadastrar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteItem} onClose={()=>setDeleteItem(null)} title="Confirmar Exclusão">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{background:'#fef2f2'}}><Trash2 size={20} style={{color:'#ef4444'}} /></div>
          <p className="text-sm text-gray-600">Excluir o lançamento de <strong>{formatCurrency(deleteItem?.valor)}</strong> — {deleteItem?.categoria}?</p>
          <div className="flex gap-3">
            <button onClick={()=>setDeleteItem(null)} className="flex-1 py-2.5 text-sm font-medium border border-gray-200 rounded-xl">Cancelar</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 text-sm font-medium text-white rounded-xl" style={{background:'#ef4444'}}>Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}