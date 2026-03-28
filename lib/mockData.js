// Mock data for demo/testing purposes
// Used when Supabase tables are empty or not yet configured

export const mockVendas = [
  { id: 1, empresa_id: 1, produto: 'Software ERP', cliente: 'Tech Solutions Ltda', valor: 15000, data: '2024-01-15' },
  { id: 2, empresa_id: 1, produto: 'Consultoria', cliente: 'Inovação Digital SA', valor: 8500, data: '2024-01-22' },
  { id: 3, empresa_id: 1, produto: 'Licença Anual', cliente: 'StartupXYZ', valor: 4200, data: '2024-02-03' },
  { id: 4, empresa_id: 1, produto: 'Suporte Premium', cliente: 'Global Corp', valor: 3600, data: '2024-02-18' },
  { id: 5, empresa_id: 1, produto: 'Software ERP', cliente: 'Comércio Rápido', valor: 12000, data: '2024-03-05' },
  { id: 6, empresa_id: 1, produto: 'Treinamento', cliente: 'RH Master', valor: 2800, data: '2024-03-20' },
  { id: 7, empresa_id: 1, produto: 'Consultoria', cliente: 'Agro Solutions', valor: 9800, data: '2024-04-10' },
  { id: 8, empresa_id: 1, produto: 'Licença Anual', cliente: 'Finance Pro', valor: 6400, data: '2024-04-25' },
  { id: 9, empresa_id: 1, produto: 'Software ERP', cliente: 'Construções ABC', valor: 18000, data: '2024-05-08' },
  { id: 10, empresa_id: 1, produto: 'Suporte Premium', cliente: 'Saúde Total', valor: 4200, data: '2024-05-22' },
  { id: 11, empresa_id: 1, produto: 'Consultoria', cliente: 'Logística Plus', valor: 7600, data: '2024-06-03' },
  { id: 12, empresa_id: 1, produto: 'Treinamento', cliente: 'Educa Corp', valor: 3200, data: '2024-06-19' },
  { id: 13, empresa_id: 1, produto: 'Software ERP', cliente: 'Varejo Express', valor: 14500, data: '2024-07-07' },
  { id: 14, empresa_id: 1, produto: 'Licença Anual', cliente: 'TechStart', valor: 5100, data: '2024-07-21' },
  { id: 15, empresa_id: 1, produto: 'Suporte Premium', cliente: 'Digital First', valor: 3800, data: '2024-08-12' },
]

export const mockFinanceiro = [
  { id: 1, empresa_id: 1, tipo: 'receita', valor: 15000, categoria: 'Vendas', descricao: 'Venda Software ERP', data: '2024-01-15' },
  { id: 2, empresa_id: 1, tipo: 'despesa', valor: 3200, categoria: 'Salários', descricao: 'Folha de pagamento', data: '2024-01-31' },
  { id: 3, empresa_id: 1, tipo: 'despesa', valor: 1800, categoria: 'Marketing', descricao: 'Google Ads', data: '2024-01-28' },
  { id: 4, empresa_id: 1, tipo: 'receita', valor: 8500, categoria: 'Consultoria', descricao: 'Projeto Inovação Digital', data: '2024-02-05' },
  { id: 5, empresa_id: 1, tipo: 'despesa', valor: 2400, categoria: 'Infraestrutura', descricao: 'Servidores AWS', data: '2024-02-15' },
  { id: 6, empresa_id: 1, tipo: 'despesa', valor: 3200, categoria: 'Salários', descricao: 'Folha de pagamento', data: '2024-02-29' },
  { id: 7, empresa_id: 1, tipo: 'receita', valor: 16200, categoria: 'Vendas', descricao: 'Software + Licenças', data: '2024-03-08' },
  { id: 8, empresa_id: 1, tipo: 'despesa', valor: 1200, categoria: 'Administrativo', descricao: 'Aluguel escritório', data: '2024-03-10' },
  { id: 9, empresa_id: 1, tipo: 'despesa', valor: 3200, categoria: 'Salários', descricao: 'Folha de pagamento', data: '2024-03-31' },
  { id: 10, empresa_id: 1, tipo: 'receita', valor: 16200, categoria: 'Vendas', descricao: 'Consultoria + Licenças', data: '2024-04-12' },
  { id: 11, empresa_id: 1, tipo: 'despesa', valor: 4500, categoria: 'Marketing', descricao: 'Campanha Digital Q2', data: '2024-04-20' },
  { id: 12, empresa_id: 1, tipo: 'despesa', valor: 3200, categoria: 'Salários', descricao: 'Folha de pagamento', data: '2024-04-30' },
  { id: 13, empresa_id: 1, tipo: 'receita', valor: 22200, categoria: 'Vendas', descricao: 'ERP + Suporte', data: '2024-05-10' },
  { id: 14, empresa_id: 1, tipo: 'despesa', valor: 2800, categoria: 'Infraestrutura', descricao: 'Upgrade servidores', data: '2024-05-15' },
  { id: 15, empresa_id: 1, tipo: 'despesa', valor: 3200, categoria: 'Salários', descricao: 'Folha de pagamento', data: '2024-05-31' },
]

export const mockDashboardStats = {
  totalVendas: 109700,
  receitaMes: 22200,
  totalDespesas: 28700,
  lucroLiquido: 80900,
}

export const mockVendasPorMes = [
  { mes: 'Jan', vendas: 23500, meta: 20000 },
  { mes: 'Fev', vendas: 16600, meta: 20000 },
  { mes: 'Mar', vendas: 19000, meta: 22000 },
  { mes: 'Abr', vendas: 22400, meta: 22000 },
  { mes: 'Mai', vendas: 26700, meta: 25000 },
  { mes: 'Jun', vendas: 24800, meta: 25000 },
  { mes: 'Jul', vendas: 28200, meta: 28000 },
  { mes: 'Ago', vendas: 18900, meta: 28000 },
]

export const mockDespesasPorCategoria = [
  { categoria: 'Salários', valor: 22400, fill: '#5b6ef5' },
  { categoria: 'Marketing', valor: 6300, fill: '#06b6d4' },
  { categoria: 'Infraestrutura', valor: 7200, fill: '#8b5cf6' },
  { categoria: 'Administrativo', valor: 4800, fill: '#f59e0b' },
  { categoria: 'Outros', valor: 2100, fill: '#10b981' },
]

export const mockLucroMensal = [
  { mes: 'Jan', receita: 23500, despesas: 8200, lucro: 15300 },
  { mes: 'Fev', receita: 16600, despesas: 8400, lucro: 8200 },
  { mes: 'Mar', receita: 19000, despesas: 7600, lucro: 11400 },
  { mes: 'Abr', receita: 22400, despesas: 11900, lucro: 10500 },
  { mes: 'Mai', receita: 26700, despesas: 9200, lucro: 17500 },
  { mes: 'Jun', receita: 24800, despesas: 8100, lucro: 16700 },
  { mes: 'Jul', receita: 28200, despesas: 8900, lucro: 19300 },
  { mes: 'Ago', receita: 18900, despesas: 7200, lucro: 11700 },
]

export const mockCrescimentoReceita = [
  { mes: 'Jan', crescimento: 0 },
  { mes: 'Fev', crescimento: -29.4 },
  { mes: 'Mar', crescimento: 14.5 },
  { mes: 'Abr', crescimento: 17.9 },
  { mes: 'Mai', crescimento: 19.2 },
  { mes: 'Jun', crescimento: -7.1 },
  { mes: 'Jul', crescimento: 13.7 },
  { mes: 'Ago', crescimento: -33.0 },
]