'use client'

import { useState } from 'react'
import Navbar from '../../../components/sidebar/Navbar'
import { Building2, Bell, Shield, Database, Save, CheckCircle } from 'lucide-react'

const cls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"

export default function ConfiguracoesPage() {
  const [saved, setSaved] = useState(false)
  const [empresa, setEmpresa] = useState({ nome:'Minha Empresa Ltda', email:'contato@empresa.com', telefone:'(11) 9 9999-9999', cnpj:'00.000.000/0001-00', endereco:'Rua Exemplo, 123 - São Paulo, SP' })
  const [notifs, setNotifs] = useState({ vendas:true, relatorios:true, financeiro:false, weekly:true })

  function handleSave() { setSaved(true); setTimeout(()=>setSaved(false),3000) }

  return (
    <div>
      <Navbar title="Configurações" subtitle="Personalize seu ambiente" />
      <div className="p-4 sm:p-6 max-w-3xl space-y-4 sm:space-y-5">

        {/* Empresa */}
        <Section icon={Building2} iconBg="#f0f4ff" iconColor="#4350e8" title="Dados da Empresa" desc="Informações gerais do negócio">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Nome</label>
              <input className={cls} value={empresa.nome} onChange={e=>setEmpresa({...empresa,nome:e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">E-mail</label>
              <input className={cls} type="email" value={empresa.email} onChange={e=>setEmpresa({...empresa,email:e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <input className={cls} value={empresa.telefone} onChange={e=>setEmpresa({...empresa,telefone:e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">CNPJ</label>
              <input className={cls} value={empresa.cnpj} onChange={e=>setEmpresa({...empresa,cnpj:e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Endereço</label>
              <input className={cls} value={empresa.endereco} onChange={e=>setEmpresa({...empresa,endereco:e.target.value})} />
            </div>
          </div>
        </Section>

        {/* Notificações */}
        <Section icon={Bell} iconBg="#fffbeb" iconColor="#d97706" title="Notificações" desc="Controle os alertas do sistema">
          <div className="space-y-1">
            {[
              { key:'vendas',     label:'Alertas de Novas Vendas',    desc:'Notificar quando uma nova venda for cadastrada' },
              { key:'relatorios', label:'Relatórios Prontos',         desc:'Avisar quando um relatório for gerado' },
              { key:'financeiro', label:'Movimentações Financeiras',  desc:'Alertas para receitas e despesas' },
              { key:'weekly',     label:'Resumo Semanal',             desc:'E-mail de resumo toda semana' },
            ].map(item=>(
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{item.desc}</p>
                </div>
                <button onClick={()=>setNotifs(p=>({...p,[item.key]:!p[item.key]}))}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
                  style={{background:notifs[item.key]?'#5b6ef5':'#e5e7eb'}}>
                  <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200" style={{transform:notifs[item.key]?'translateX(22px)':'translateX(4px)'}} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* Supabase */}
        <Section icon={Database} iconBg="#ecfdf5" iconColor="#059669" title="Banco de Dados" desc="Conexão Supabase">
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-sm font-medium" style={{color:'#166534'}}>Conexão ativa com Supabase</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">URL</label>
              <input className={cls + ' text-gray-400 cursor-not-allowed'} value="https://dvhdfrwhdiqxzwfmhqsm.supabase.co" readOnly />
            </div>
          </div>
        </Section>

        {/* Segurança */}
        <Section icon={Shield} iconBg="#fef2f2" iconColor="#ef4444" title="Segurança" desc="Gerencie senhas e acesso">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Senha Atual</label>
              <input className={cls} type="password" placeholder="••••••••" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Nova Senha</label>
              <input className={cls} type="password" placeholder="••••••••" />
            </div>
          </div>
        </Section>

        {/* Save */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold text-white py-3 px-6 rounded-xl transition-all"
            style={{background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#5b6ef5,#4350e8)'}}>
            {saved ? <><CheckCircle size={16}/>Salvo!</> : <><Save size={16}/>Salvar Configurações</>}
          </button>
          {saved && <p className="text-sm" style={{color:'#059669'}}>Configurações salvas com sucesso.</p>}
        </div>

      </div>
    </div>
  )
}

function Section({ icon: Icon, iconBg, iconColor, title, desc, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5" style={{boxShadow:'0 1px 3px rgba(0,0,0,0.07)'}}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:iconBg}}>
          <Icon size={16} style={{color:iconColor}} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base" style={{fontFamily:'Plus Jakarta Sans,sans-serif'}}>{title}</h3>
          <p className="text-xs text-gray-400 hidden sm:block">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  )
}