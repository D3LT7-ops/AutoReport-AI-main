// ============================================================
// app/api/admin/route.js
// API do painel admin — protegida pelo token HMAC gerado
// em /api/admin/auth. Usa SUPABASE_SERVICE_ROLE_KEY para
// acessar dados de todos os usuários ignorando RLS.
// ============================================================
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac, timingSafeEqual } from 'crypto'

// Cria cliente admin dentro das funções (evita erro no build)
function getAdminClient() {
  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Variáveis Supabase não configuradas.')
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Valida o token HMAC enviado pelo painel admin
function validarToken(token) {
  const secretKey = process.env.ADMIN_SECRET_KEY
  if (!secretKey || !token) return false

  const partes = token.split('.')
  if (partes.length !== 3) return false

  const [ts, rand, sig] = partes
  const payload     = `${ts}.${rand}`
  const sigEsperada = createHmac('sha256', secretKey).update(payload).digest('hex')

  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(sigEsperada)
    if (a.length !== b.length) return false
    if (!timingSafeEqual(a, b)) return false
  } catch { return false }

  // Verifica expiração (8 horas)
  if (Date.now() - parseInt(ts) > 8 * 60 * 60 * 1000) return false

  return true
}

// ── GET: dados do painel ─────────────────────────────────────
export async function GET(request) {
  try {
    const token = request.headers.get('x-admin-token')
    if (!validarToken(token)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 })
    }

    const admin = getAdminClient()
    const { searchParams } = new URL(request.url)
    const periodo = parseInt(searchParams.get('periodo') || '30')

    const dataInicio    = new Date()
    dataInicio.setDate(dataInicio.getDate() - periodo)
    const dataInicioISO = dataInicio.toISOString()

    // Todos os usuários
    const { data: usuarios } = await admin
      .from('perfis')
      .select('id, email, nome, empresa, plano, status, ultimo_login, criado_em')
      .eq('role', 'user')
      .order('criado_em', { ascending: false })

    // Stats gerais
    const { data: stats } = await admin
      .from('admin_stats')
      .select('*')
      .single()

    // Novos cadastros no período (para o gráfico)
    const { data: novosCadastros } = await admin
      .from('perfis')
      .select('criado_em')
      .eq('role', 'user')
      .gte('criado_em', dataInicioISO)
      .order('criado_em', { ascending: true })

    // Usuários que fizeram login no período
    const { data: ativosNoPeriodo } = await admin
      .from('perfis')
      .select('id, email, nome, plano, status, ultimo_login')
      .eq('role', 'user')
      .gte('ultimo_login', dataInicioISO)
      .order('ultimo_login', { ascending: false })

    const cadastrosPorDia = agruparPorDia(novosCadastros || [], 'criado_em', periodo)

    return NextResponse.json({
      ok: true,
      stats: stats || {},
      usuarios: usuarios || [],
      ativosNoPeriodo: ativosNoPeriodo || [],
      cadastrosPorDia,
    })
  } catch (err) {
    console.error('Admin GET error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── PATCH: atualizar status do usuário ───────────────────────
export async function PATCH(request) {
  try {
    const token = request.headers.get('x-admin-token')
    if (!validarToken(token)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 401 })
    }

    const admin            = getAdminClient()
    const { userId, status } = await request.json()

    if (!userId || !status) {
      return NextResponse.json({ error: 'userId e status são obrigatórios' }, { status: 400 })
    }

    const { error } = await admin.from('perfis').update({ status }).eq('id', userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── Helper: agrupa por dia preenchendo zeros ─────────────────
function agruparPorDia(registros, campo, dias) {
  const mapa = {}
  for (let i = dias; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const chave = d.toISOString().split('T')[0]
    mapa[chave] = 0
  }
  registros.forEach(r => {
    const chave = r[campo]?.split('T')[0]
    if (chave && mapa[chave] !== undefined) mapa[chave]++
  })
  return Object.entries(mapa).map(([data, total]) => ({
    data: `${data.split('-')[2]}/${data.split('-')[1]}`,
    total,
  }))
}