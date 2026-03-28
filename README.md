# ⚡ AutoReport AI

Plataforma SaaS completa de automação de relatórios empresariais. Conta com autenticação real via Supabase, dashboard interativo com gráficos, gestão de vendas e financeiro, exportação de relatórios em PDF e Excel, integração com Mercado Pago para assinaturas recorrentes e painel administrativo protegido por chave secreta.

Totalmente responsiva — funciona perfeitamente no celular, tablet e desktop.

---

## 🗺️ Fluxo de Navegação

```
/ ─────────────────── Landing Page (pública)
│
├── /login ──────────── Cadastro + Login + Recuperação de senha
│   ├── /auth/callback      Confirmação de e-mail (Supabase)
│   └── /auth/nova-senha    Redefinição de senha via link
│
├── /admin/login ────── Acesso ao painel admin (chave secreta)
│   └── /admin              Painel administrativo exclusivo
│
├── /pagamento/sucesso ─ Retorno após pagamento aprovado (MP)
└── /pagamento/cancelado Retorno após pagamento cancelado (MP)

Área protegida por AuthGuard (requer login):
└── /dashboard ────────── KPIs + 4 gráficos em tempo real
    ├── /vendas            CRUD completo de vendas
    ├── /financeiro        Controle de receitas e despesas
    ├── /relatorios        Gerador de relatórios PDF e Excel
    ├── /planos            Planos de assinatura + checkout MP
    └── /configuracoes     Configurações da conta
```

---

## 📁 Estrutura Completa do Projeto

```
autoreport-ai/
│
├── app/
│   ├── page.js                          # Redireciona para landing/page.js
│   ├── layout.js                        # Root layout (fontes Google, metadata)
│   ├── globals.css                      # Estilos globais + diretivas Tailwind
│   │
│   ├── landing/
│   │   └── page.js                      # Landing page pública
│   │                                    # Navbar responsiva, hero, stats,
│   │                                    # features, how it works, pricing, footer
│   │
│   ├── login/
│   │   └── page.js                      # Tela unificada com 3 abas:
│   │                                    # · Entrar (login Supabase)
│   │                                    # · Criar conta (cadastro + email confirmação)
│   │                                    # · Esqueci minha senha (recuperação)
│   │
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.js                 # Troca ?code= por sessão ativa
│   │   │                                # Supabase chama após confirmar email
│   │   │                                # Redireciona: /dashboard ou /auth/nova-senha
│   │   └── nova-senha/
│   │       └── page.js                  # Tela para definir nova senha
│   │                                    # Ativada pelo link de recuperação
│   │
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.js                  # Tela escura de acesso admin
│   │   │                                # Campo de chave secreta (ADMIN_SECRET_KEY)
│   │   │                                # Não listada, não indexada
│   │   └── page.js                      # Painel administrativo completo
│   │                                    # Dados reais do Supabase via /api/admin
│   │
│   ├── api/
│   │   ├── admin/
│   │   │   ├── route.js                 # GET: lista usuários, stats, gráfico cadastros
│   │   │   │                            # PATCH: atualiza status do usuário
│   │   │   │                            # Usa SUPABASE_SERVICE_ROLE_KEY (server only)
│   │   │   ├── auth/
│   │   │   │   └── route.js             # POST: valida chave secreta e gera token HMAC
│   │   │   └── verify/
│   │   │       └── route.js             # POST: verifica assinatura do token admin
│   │   │
│   │   ├── auth/
│   │   │   └── criar-perfil/
│   │   │       └── route.js             # POST: cria registro na tabela perfis
│   │   │                                # Chamado após cadastro no Supabase Auth
│   │   │
│   │   ├── pagamento/
│   │   │   └── route.js                 # POST: cria preferência no Mercado Pago
│   │   │                                # Retorna URL do checkout
│   │   │
│   │   └── webhook/
│   │       └── mercadopago/
│   │           └── route.js             # POST: recebe eventos do Mercado Pago
│   │                                    # Processa: pagamento aprovado, assinatura
│   │                                    # ativa/cancelada
│   │
│   ├── pagamento/
│   │   ├── sucesso/
│   │   │   └── page.js                  # Retorno MP: pagamento aprovado/pendente
│   │   │                                # Lê ?status= da URL via useSearchParams
│   │   └── cancelado/
│   │       └── page.js                  # Retorno MP: pagamento não realizado
│   │
│   └── (app)/                           # Grupo de rotas protegidas
│       ├── layout.js                    # Aplica Sidebar + AuthGuard em todas as rotas
│       ├── dashboard/
│       │   ├── layout.js                # Layout passthrough
│       │   └── page.js                  # 4 cards de KPI + 4 gráficos Recharts
│       │                                # Dados reais do Supabase com fallback mock
│       ├── vendas/
│       │   └── page.js                  # CRUD completo de vendas
│       │                                # Cards no mobile, tabela no desktop
│       │                                # Modal bottom sheet / centralizado
│       ├── financeiro/
│       │   └── page.js                  # Controle de receitas e despesas
│       │                                # Filtro por tipo, busca por texto
│       ├── relatorios/
│       │   └── page.js                  # Seletor de tipo de relatório
│       │                                # Filtro por período (data início/fim)
│       │                                # Exportação PDF (jsPDF) e Excel (SheetJS)
│       ├── planos/
│       │   └── page.js                  # Cards Starter / Pro / Business
│       │                                # Integrado com /api/pagamento
│       │                                # Redireciona para checkout Mercado Pago
│       └── configuracoes/
│           └── page.js                  # Dados da empresa, notificações (toggles),
│                                        # conexão Supabase, redefinição de senha
│
├── components/
│   ├── AuthGuard.js                     # Proteção de rotas de usuário
│   │                                    # supabase.auth.getSession() + onAuthStateChange
│   │                                    # Redireciona para /login se sem sessão
│   │
│   ├── AdminGuard.js                    # Proteção do painel admin
│   │                                    # Verifica token HMAC no sessionStorage
│   │                                    # Valida via /api/admin/verify
│   │                                    # Expira em 8 horas automaticamente
│   │
│   ├── sidebar/
│   │   ├── Sidebar.js                   # Menu lateral desktop (fixo)
│   │   │                                # Drawer hamburguer no mobile
│   │   │                                # Nome/email do usuário via getSessionAsync()
│   │   │                                # Logout via supabase.auth.signOut()
│   │   └── Navbar.js                    # Barra superior com título da página,
│   │                                    # data atual e ícone de notificação
│   │
│   ├── cards/
│   │   └── StatsCard.js                 # Card de KPI reutilizável
│   │                                    # Aceita iconName (string) — evita erro SSR
│   │                                    # Suporta cores: brand, green, red, purple
│   │
│   ├── charts/
│   │   └── Charts.js                    # 4 componentes Recharts:
│   │                                    # · VendasPorMesChart (BarChart)
│   │                                    # · DespesasPorCategoriaChart (PieChart)
│   │                                    # · LucroMensalChart (AreaChart)
│   │                                    # · CrescimentoChart (LineChart)
│   │
│   └── ui/
│       ├── Button.js                    # Botão com variantes e estado loading
│       ├── Input.js                     # Input e Select reutilizáveis
│       └── Modal.js                     # Bottom sheet (mobile) / centrado (desktop)
│
├── lib/
│   ├── supabase.js                      # createClient com:
│   │                                    # · persistSession: true
│   │                                    # · detectSessionInUrl: true
│   │                                    # · autoRefreshToken: true
│   │
│   ├── auth.js                          # Todas as funções de autenticação:
│   │                                    # · cadastrar() — signUp + email confirmação
│   │                                    # · login() — signInWithPassword
│   │                                    # · logout() — signOut
│   │                                    # · getSession() — síncrono (localStorage)
│   │                                    # · getSessionAsync() — assíncrono (Supabase)
│   │                                    # · recuperarSenha() — resetPasswordForEmail
│   │                                    # · redefinirSenha() — updateUser
│   │
│   ├── mercadopago.js                   # Integração Mercado Pago:
│   │                                    # · criarPreferencia() — checkout pro
│   │                                    # · criarAssinatura() — preapproval
│   │                                    # · buscarAssinatura() — get preapproval
│   │                                    # · cancelarAssinatura() — cancel
│   │                                    # · processarWebhook() — eventos MP
│   │
│   ├── mockData.js                      # Dados de exemplo para fallback automático
│   │                                    # Usado quando Supabase não responde
│   │
│   └── formatters.js                    # Utilitários:
│                                        # · formatCurrency() — R$ 1.234,56
│                                        # · formatDate() — DD/MM/YYYY
│                                        # · formatPercent() — 12,5%
│
├── services/
│   ├── vendasService.js                 # getAll, create, update, delete
│   │                                    # getVendasPorMes, getTotalVendas
│   │                                    # Fallback automático para mockData
│   │
│   ├── financeiroService.js             # getAll, create, update, delete
│   │                                    # getSummary, getDespesasPorCategoria
│   │                                    # getLucroMensal — fallback automático
│   │
│   └── relatorioService.js              # getRelatorioVendas
│                                        # getRelatorioFinanceiro
│                                        # getFluxoCaixa
│                                        # getDesempenhoMensal
│
├── supabase_setup.sql                   # Schema principal:
│                                        # tabelas: empresas, usuarios, vendas,
│                                        # financeiro, relatorios
│                                        # Dados de exemplo + políticas RLS
│
├── supabase_admin.sql                   # Schema do sistema admin:
│                                        # tabela: perfis (espelha auth.users)
│                                        # trigger: handle_new_user (auto-insert)
│                                        # trigger: handle_user_login (ultimo_login)
│                                        # view: admin_stats
│                                        # RLS por usuário
│
├── .env.local                           # Variáveis locais (nunca sobe no Git)
├── .env.example                         # Template das variáveis
├── next.config.js                       # ignoreDuringBuilds ESLint + TypeScript
│                                        # output: standalone
├── tailwind.config.js                   # Tema customizado + safelist dinâmico
│                                        # content com path.join(__dirname)
├── postcss.config.js                    # Tailwind + Autoprefixer explícito
├── vercel.json                          # Framework nextjs, sem referência a secrets
└── package.json                         # Dependências do projeto
```

---

## 🛠️ Stack de Tecnologias

| Tecnologia | Versão | Finalidade |
|---|---|---|
| Next.js | 14.1.0 | Framework principal (App Router) |
| React | 18 | Interface do usuário |
| TailwindCSS | 3.3 | Estilização utilitária responsiva |
| Supabase JS | 2.39 | Banco de dados + Autenticação |
| Recharts | 2.12 | Gráficos interativos do dashboard |
| jsPDF | 2.5 | Geração de PDF no navegador |
| jsPDF-AutoTable | 3.8 | Tabelas formatadas nos PDFs |
| SheetJS (xlsx) | 0.18 | Exportação de planilhas Excel |
| Lucide React | 0.344 | Biblioteca de ícones |
| date-fns | 3.3 | Formatação e manipulação de datas |
| Mercado Pago API | — | Pagamentos e assinaturas recorrentes |
| Node.js crypto | nativo | Tokens HMAC para autenticação admin |

---

## 🚀 Como rodar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/D3LT7-ops/AutoReport-AI.git
cd AutoReport-AI
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o `.env.local` com seus valores:

```env
# ── Supabase ──────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# ── Servidor (nunca vai ao frontend) ──────────────
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# ── App ───────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Admin (chave secreta de acesso ao painel) ─────
ADMIN_SECRET_KEY=SuaChaveSecretaAqui123!

# ── Mercado Pago ──────────────────────────────────
MP_ACCESS_TOKEN=TEST-xxxx           # sandbox para testes
# MP_ACCESS_TOKEN=APP_USR-xxxx      # produção real
MP_PLANO_PRO_ID=                    # ID do plano criado no painel MP
MP_PLANO_BUSINESS_ID=               # ID do plano criado no painel MP
```

### 4. Configure o banco de dados

No **Supabase Dashboard → SQL Editor**, execute os scripts nesta ordem:

```
1. supabase_setup.sql     — tabelas principais + dados de exemplo
2. supabase_admin.sql     — tabela perfis + triggers + view admin_stats
```

### 5. Inicie o servidor

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🔑 Variáveis de Ambiente — Referência Completa

| Variável | Onde usar | Obrigatória | Descrição |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Frontend + Backend | ✅ | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend + Backend | ✅ | Chave pública (anon) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Somente backend | ✅ | Chave secreta admin do Supabase — ignora RLS |
| `NEXT_PUBLIC_APP_URL` | Frontend + Backend | ✅ | URL pública do site (sem barra no final) |
| `ADMIN_SECRET_KEY` | Somente backend | ✅ | Chave de acesso ao painel `/admin` |
| `MP_ACCESS_TOKEN` | Somente backend | ✅ | Token do Mercado Pago (TEST- ou APP_USR-) |
| `MP_PLANO_PRO_ID` | Somente backend | ❌ | ID do plano Pro criado no painel MP |
| `MP_PLANO_BUSINESS_ID` | Somente backend | ❌ | ID do plano Business criado no painel MP |

> ⚠️ Variáveis sem `NEXT_PUBLIC_` **nunca** chegam ao navegador — ficam apenas nas API Routes do servidor.

---

## 🔐 Sistema de Autenticação

O projeto usa **Supabase Authentication** com verificação real de e-mail.

### Cadastro

```
1. Usuário preenche nome, e-mail e senha em /login → aba "Criar conta"
2. supabase.auth.signUp() cria a conta
3. Supabase dispara e-mail de confirmação automaticamente
4. Usuário clica no link → /auth/callback?code=xxx
5. Rota troca o code por sessão ativa
6. Redireciona para /dashboard
```

### Login

```
1. supabase.auth.signInWithPassword() valida credenciais
2. Se e-mail não confirmado → erro amigável na tela
3. Se válido → sessão salva automaticamente (persistSession: true)
4. Redireciona para /dashboard
```

### Recuperação de senha

```
1. Usuário clica "Esqueci minha senha" e informa o e-mail
2. supabase.auth.resetPasswordForEmail() envia link
3. Usuário clica → /auth/nova-senha
4. supabase.auth.updateUser() salva nova senha
5. Redireciona para /dashboard
```

### Proteção de rotas (AuthGuard)

O componente `AuthGuard` envolve todas as rotas do grupo `(app)` e:
- Chama `supabase.auth.getSession()` ao montar
- Escuta `onAuthStateChange` em tempo real
- Se sessão expirar ou logout em outra aba → redireciona para `/login` automaticamente

### Funções disponíveis em `lib/auth.js`

| Função | Tipo | Descrição |
|---|---|---|
| `cadastrar({ email, password, nome, empresa })` | async | Cria conta + dispara e-mail de confirmação |
| `login(email, password)` | async | Autentica via Supabase + mensagens de erro traduzidas |
| `logout()` | async | Encerra sessão no Supabase + limpa legado |
| `getSession()` | sync | Lê sessão do localStorage (uso imediato) |
| `getSessionAsync()` | async | Lê sessão do Supabase (uso em useEffect) |
| `recuperarSenha(email)` | async | Envia link de recuperação por e-mail |
| `redefinirSenha(novaSenha)` | async | Atualiza senha após link de recuperação |

---

## 🛡️ Painel Administrativo

O painel admin é acessível apenas por você, através de uma chave secreta definida como variável de ambiente.

### Como acessar

```
https://seu-site.vercel.app/admin/login
```

Digite o valor de `ADMIN_SECRET_KEY` e clique em **Acessar painel**. A sessão dura **8 horas** e expira automaticamente ao fechar o navegador (sessionStorage).

### Como funciona a segurança

```
1. Você digita a chave em /admin/login
2. POST /api/admin/auth → valida com timingSafeEqual (evita timing attacks)
3. Gera token HMAC assinado: timestamp.random.assinatura
4. Token salvo no sessionStorage (expira ao fechar o browser)
5. AdminGuard verifica o token a cada acesso via /api/admin/verify
6. Token inválido ou expirado → volta para /admin/login
```

### O que o painel mostra

- Total de usuários cadastrados
- Usuários com status ativo
- Usuários que fizeram login no período (7 / 30 / 90 dias)
- Novos cadastros no período
- Gráfico de crescimento de cadastros por dia (AreaChart)
- Distribuição por plano: Starter / Pro / Business
- Tabela completa com e-mail, nome, plano, status e último login
- Aba de usuários ativos no período selecionado
- Busca por e-mail ou nome

### Configuração no Supabase

Execute o `supabase_admin.sql` para criar:

| Objeto | Tipo | Descrição |
|---|---|---|
| `perfis` | Tabela | Espelha auth.users com role, plano, status |
| `handle_new_user` | Função + Trigger | Cria perfil automaticamente ao cadastrar |
| `handle_user_login` | Função + Trigger | Atualiza `ultimo_login` ao entrar |
| `admin_stats` | View | Estatísticas agregadas para o painel |

---

## 🗄️ Banco de Dados

### Tabelas principais (`supabase_setup.sql`)

| Tabela | Campos principais | Descrição |
|---|---|---|
| `empresas` | id, nome, email, cnpj, criado_em | Cadastro de empresas |
| `usuarios` | id, nome, email, empresa_id, criado_em | Usuários por empresa |
| `vendas` | id, empresa_id, produto, cliente, valor, data | Registro de vendas |
| `financeiro` | id, empresa_id, tipo, valor, categoria, descricao, data | Lançamentos financeiros |
| `relatorios` | id, empresa_id, tipo, periodo_inicio, periodo_fim, arquivo_url | Histórico de relatórios |

### Tabela admin (`supabase_admin.sql`)

| Tabela | Campos principais | Descrição |
|---|---|---|
| `perfis` | id (UUID), email, nome, empresa, role, plano, status, ultimo_login, criado_em | Perfil de cada usuário |

### Configuração obrigatória no Supabase

1. **Authentication → Providers → Email** → ative **"Confirm email"**
2. **Authentication → URL Configuration**
   - Site URL: `https://seu-projeto.vercel.app`
   - Redirect URLs: `https://seu-projeto.vercel.app/auth/callback`

---

## 💳 Pagamentos — Mercado Pago

### Planos

| Plano | Valor | Principais recursos |
|---|---|---|
| Starter | Grátis | Dashboard básico, 50 vendas/mês, PDF |
| Pro | R$ 49/mês | Ilimitado, Excel, gráficos avançados, suporte prioritário |
| Business | R$ 99/mês | Multi-empresas, API, relatórios personalizados, gerente de conta |

### Fluxo de pagamento

```
1. Usuário escolhe plano em /planos e clica em "Assinar"
2. POST /api/pagamento → cria preferência no Mercado Pago
3. Usuário é redirecionado para o checkout oficial do MP
4. Após pagamento:
   · Aprovado  → /pagamento/sucesso?status=approved
   · Pendente  → /pagamento/sucesso?status=pending
   · Cancelado → /pagamento/cancelado
5. MP envia webhook para /api/webhook/mercadopago
6. Webhook processa: ativa/cancela assinatura no banco
```

### Credenciais MP

- **Sandbox (testes):** token começa com `TEST-` — pagamentos fictícios
- **Produção:** token começa com `APP_USR-` — cobranças reais
- Obtenha em: [mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel)

> ⚠️ **Nunca** compartilhe seu `MP_ACCESS_TOKEN` em chats, commits ou código público.

---

## 📊 Módulo de Relatórios

| Tipo | O que contém | PDF | Excel |
|---|---|---|---|
| Vendas | Histórico de vendas por período + resumo (total, ticket médio) | ✅ | ✅ |
| Financeiro | Receitas, despesas, lucro líquido por período | ✅ | ✅ |
| Fluxo de Caixa | Entradas e saídas mês a mês | ✅ | ✅ |
| Desempenho Mensal | Análise comparativa mensal do ano | ✅ | ✅ |

Os PDFs são gerados com cabeçalho estilizado (AutoReport AI), tabelas formatadas e número de páginas. Os arquivos Excel têm múltiplas abas (Resumo + Dados).

---

## 📱 Responsividade

O projeto usa uma estratégia de **renderização dupla** — o mesmo dado é exibido de formas diferentes conforme o tamanho da tela:

| Breakpoint | Comportamento |
|---|---|
| Mobile `< 640px` | Cards empilhados em lista, modais como bottom sheet, menu hamburguer com drawer lateral, botões full-width |
| Tablet `640–1024px` | Grid 2 colunas, tabelas com scroll horizontal, modais centralizados |
| Desktop `> 1024px` | Sidebar fixa de 256px, tabelas completas, modais centralizados, gráficos full-width |

---

## 🔄 Fallback Automático

Se o Supabase não estiver configurado ou as tabelas estiverem vazias, todos os services retornam dados de `lib/mockData.js` automaticamente — o sistema nunca quebra por falta de dados.

---

## ☁️ Deploy na Vercel

### 1. Suba para o GitHub

```bash
git add .
git commit -m "feat: autoreport ai completo"
git push origin main
```

### 2. Importe na Vercel

1. Acesse [vercel.com](https://vercel.com) → **New Project**
2. Importe o repositório
3. Em **Environment Variables** adicione todas as variáveis do `.env.example`
4. Clique em **Deploy**

### Checklist para o build não quebrar

- [x] Todo componente com hooks ou eventos tem `'use client'` na primeira linha
- [x] `useSearchParams()` sempre dentro de `<Suspense>`
- [x] Ícones passados como `iconName="ShoppingCart"` (string), nunca como `icon={Component}`
- [x] Clientes Supabase criados dentro de funções (não no topo do módulo) nas API routes
- [x] `next.config.js` com `eslint.ignoreDuringBuilds: true`
- [x] `tailwind.config.js` com `path.join(__dirname, ...)` no array `content`
- [x] `postcss.config.js` com `tailwindcss: { config: './tailwind.config.js' }`
- [x] `vercel.json` sem referência a `@secrets`
- [x] Imports de `lib/` usando `../../lib/` nas páginas dentro de `app/(app)/`
- [x] Imports de `lib/` usando `../lib/` nas páginas dentro de `app/login/` e `app/landing/`

---

## 🧰 Comandos

```bash
npm run dev      # Inicia servidor de desenvolvimento (localhost:3000)
npm run build    # Gera build de produção
npm run start    # Inicia servidor de produção
npm run lint     # Verifica erros de código com ESLint
```

---

## 🗺️ Próximos passos sugeridos

- [ ] Tabela `assinaturas` no Supabase para rastrear plano ativo por usuário
- [ ] Middleware Next.js para proteção de rotas no servidor (além do AuthGuard client-side)
- [ ] Multi-tenant: RLS no Supabase filtrando dados por `empresa_id` do usuário logado
- [ ] Upload de logo da empresa via Supabase Storage
- [ ] Notificações por e-mail via Resend (vencimento de plano, relatório gerado)
- [ ] Filtros avançados e paginação nas tabelas de vendas e financeiro
- [ ] Dashboard de metas com barra de progresso visual
- [ ] Exportação automática agendada de relatórios mensais
