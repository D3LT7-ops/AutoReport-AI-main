'use client'

import { useState, useEffect } from 'react'
import Navbar from '../../../components/sidebar/Navbar'
import { vendasService } from '../../../services/vendasService'
import { formatCurrency, formatDate } from '../../../lib/formatters'
import { Plus, Pencil, Trash2, Search, ShoppingCart, TrendingUp, Users, X, Loader2 } from 'lucide-react'

const emptyForm = { produto: '', cliente: '', valor: '', data: new Date().toISOString().split('T')[0] }

function Modal({ open, onClose, title, children }) {
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
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

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"

export default function VendasPage() {
  const [vendas, setVendas]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [editItem, setEditItem]   = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [errors, setErrors]       = useState({})
  const [search, setSearch]       = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setVendas(await vendasService.getAll())
    setLoading(false)
  }

  function openCreate() { setEditItem(null); setForm(emptyForm); setErrors({}); setModalOpen(true) }
  function openEdit(v) { setEditItem(v); setForm({ produto: v.produto, cliente: v.cliente, valor: String(v.valor), data: v.data?.split('T')[0] || v.data }); setErrors({}); setModalOpen(true) }

  function validate() {
    const e = {}
    if (!form.produto.trim()) e.produto = 'Obrigatório'
    if (!form.cliente.trim()) e.cliente = 'Obrigatório'
    if (!form.valor || isNaN(form.valor) || Number(form.valor) <= 0) e.valor = 'Valor inválido'
    if (!form.data) e.data = 'Obrigatório'
    setErrors(e); return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    const payload = { produto: form.produto, cliente: form.cliente, valor: parseFloat(form.valor), data: form.data }
    if (editItem) {
      await vendasService.update(editItem.id, payload)
      setVendas(prev => prev.map(v => v.id === editItem.id ? { ...v, ...payload } : v))
    } else {
      const { data } = await vendasService.create(payload)
      setVendas(prev => [data || { id: Date.now(), ...payload }, ...prev])
    }
    setModalOpen(false); setSaving(false)
  }

  async function handleDelete() {
    await vendasService.delete(deleteItem.id)
    setVendas(prev => prev.filter(v => v.id !== deleteItem.id))
    setDeleteItem(null)
  }

  const filtered = vendas.filter(v =>
    v.produto?.toLowerCase().includes(search.toLowerCase()) ||
    v.cliente?.toLowerCase().includes(search.toLowerCase())
  )
  const total = vendas.reduce((s, v) => s + Number(v.valor), 0)
  const media = vendas.length ? total / vendas.length : 0
  const clientes = new Set(vendas.map(v => v.cliente)).size

  return (
    <div>
      <Navbar title="Vendas" subtitle="Gerencie suas vendas e receitas" />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

        {/* Summary cards — scroll horizontal no mobile */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: ShoppingCart, label: 'Total em Vendas', value: formatCurrency(total), color: '#4350e8', bg: '#f0f4ff' },
            { icon: TrendingUp,   label: 'Ticket Médio',   value: formatCurrency(media),  color: '#059669', bg: '#ecfdf5' },
            { icon: Users,        label: 'Clientes',        value: clientes,               color: '#7c3aed', bg: '#f5f3ff' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:c.bg}}>
                <c.icon size={16} style={{color:c.color}} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{c.label}</p>
                <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl border border-gray-100" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900" style={{fontFamily:'Plus Jakarta Sans,sans-serif'}}>Lista de Vendas</h3>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-indigo-400 w-full sm:w-44" />
              </div>
              <button onClick={openCreate} className="flex items-center gap-1.5 text-sm font-medium text-white px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap" style={{background:'linear-gradient(135deg,#5b6ef5,#4350e8)'}}>
                <Plus size={15} /><span className="hidden sm:inline">Nova Venda</span><span className="sm:hidden">Nova</span>
              </button>
            </div>
          </div>

          {/* Mobile cards view */}
          <div className="sm:hidden divide-y divide-gray-50">
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="p-4"><div className="h-16 rounded-xl animate-pulse" style={{background:'#f1f5f9'}} /></div>)
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">Nenhuma venda encontrada</div>
            ) : filtered.map(v => (
              <div key={v.id} className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{background:'#f0f4ff',color:'#4350e8'}}>
                  {v.produto?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{v.produto}</p>
                  <p className="text-xs text-gray-500 truncate">{v.cliente} · {formatDate(v.data)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-bold" style={{color:'#059669'}}>{formatCurrency(v.valor)}</span>
                  <button onClick={() => openEdit(v)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'#f0f4ff'}}><Pencil size={12} style={{color:'#4350e8'}} /></button>
                  <button onClick={() => setDeleteItem(v)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'#fef2f2'}}><Trash2 size={12} style={{color:'#ef4444'}} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Produto', 'Cliente', 'Valor', 'Data', 'Ações'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 rounded animate-pulse w-24" style={{background:'#f1f5f9'}} /></td>)}</tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">Nenhuma venda encontrada</td></tr>
                ) : filtered.map(v => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{background:'#f0f4ff',color:'#4350e8'}}>{v.produto?.charAt(0)?.toUpperCase()}</div>
                        <span className="text-sm font-medium text-gray-800">{v.produto}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{v.cliente}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold" style={{color:'#059669'}}>{formatCurrency(v.valor)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{formatDate(v.data)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(v)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-indigo-50 transition-colors"><Pencil size={13} className="text-gray-400 hover:text-indigo-500" /></button>
                        <button onClick={() => setDeleteItem(v)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"><Trash2 size={13} className="text-gray-400 hover:text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} registro(s)</div>}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Venda' : 'Nova Venda'}>
        <div className="space-y-4">
          <Field label="Produto / Serviço" error={errors.produto}>
            <input className={inputCls} placeholder="Ex: Software ERP" value={form.produto} onChange={e => setForm({...form, produto: e.target.value})} />
          </Field>
          <Field label="Cliente" error={errors.cliente}>
            <input className={inputCls} placeholder="Ex: Tech Solutions Ltda" value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} />
          </Field>
          <Field label="Valor (R$)" error={errors.valor}>
            <input className={inputCls} type="number" step="0.01" min="0" placeholder="0,00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
          </Field>
          <Field label="Data" error={errors.data}>
            <input className={inputCls} type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} />
          </Field>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm font-medium text-white rounded-xl flex items-center justify-center gap-2 transition-all" style={{background:'linear-gradient(135deg,#5b6ef5,#4350e8)'}}>
              {saving ? <><Loader2 size={14} className="animate-spin" />Salvando...</> : editItem ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={!!deleteItem} onClose={() => setDeleteItem(null)} title="Confirmar Exclusão">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{background:'#fef2f2'}}>
            <Trash2 size={20} style={{color:'#ef4444'}} />
          </div>
          <p className="text-sm text-gray-600">Excluir a venda de <strong className="text-gray-900">{deleteItem?.produto}</strong> para <strong className="text-gray-900">{deleteItem?.cliente}</strong>?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteItem(null)} className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
            <button onClick={handleDelete} className="flex-1 py-2.5 text-sm font-medium text-white rounded-xl" style={{background:'#ef4444'}}>Excluir</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}