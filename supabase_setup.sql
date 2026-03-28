-- AutoReport AI - Schema SQL para Supabase
-- Execute este script no SQL Editor do Supabase

-- ===========================
-- TABELA: empresas
-- ===========================
CREATE TABLE IF NOT EXISTS empresas (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  cnpj VARCHAR(20),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- TABELA: usuarios
-- ===========================
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  empresa_id BIGINT REFERENCES empresas(id) ON DELETE CASCADE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- TABELA: vendas
-- ===========================
CREATE TABLE IF NOT EXISTS vendas (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT NOT NULL DEFAULT 1,
  produto VARCHAR(255) NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- TABELA: financeiro
-- ===========================
CREATE TABLE IF NOT EXISTS financeiro (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT NOT NULL DEFAULT 1,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  valor DECIMAL(12, 2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao TEXT,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- TABELA: relatorios
-- ===========================
CREATE TABLE IF NOT EXISTS relatorios (
  id BIGSERIAL PRIMARY KEY,
  empresa_id BIGINT NOT NULL DEFAULT 1,
  tipo VARCHAR(50) NOT NULL,
  periodo_inicio DATE,
  periodo_fim DATE,
  arquivo_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================
-- EMPRESA DEMO (ID=1)
-- ===========================
INSERT INTO empresas (id, nome, email) 
VALUES (1, 'Empresa Demo', 'demo@empresa.com')
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- DADOS DE EXEMPLO: vendas
-- ===========================
INSERT INTO vendas (empresa_id, produto, cliente, valor, data) VALUES
  (1, 'Software ERP', 'Tech Solutions Ltda', 15000.00, '2024-01-15'),
  (1, 'Consultoria', 'Inovação Digital SA', 8500.00, '2024-01-22'),
  (1, 'Licença Anual', 'StartupXYZ', 4200.00, '2024-02-03'),
  (1, 'Suporte Premium', 'Global Corp', 3600.00, '2024-02-18'),
  (1, 'Software ERP', 'Comércio Rápido', 12000.00, '2024-03-05'),
  (1, 'Treinamento', 'RH Master', 2800.00, '2024-03-20'),
  (1, 'Consultoria', 'Agro Solutions', 9800.00, '2024-04-10'),
  (1, 'Licença Anual', 'Finance Pro', 6400.00, '2024-04-25'),
  (1, 'Software ERP', 'Construções ABC', 18000.00, '2024-05-08'),
  (1, 'Suporte Premium', 'Saúde Total', 4200.00, '2024-05-22');

-- ===========================
-- DADOS DE EXEMPLO: financeiro
-- ===========================
INSERT INTO financeiro (empresa_id, tipo, valor, categoria, descricao, data) VALUES
  (1, 'receita', 15000.00, 'Vendas', 'Venda Software ERP', '2024-01-15'),
  (1, 'despesa', 3200.00, 'Salários', 'Folha de pagamento', '2024-01-31'),
  (1, 'despesa', 1800.00, 'Marketing', 'Google Ads Janeiro', '2024-01-28'),
  (1, 'receita', 8500.00, 'Consultoria', 'Projeto Inovação Digital', '2024-02-05'),
  (1, 'despesa', 2400.00, 'Infraestrutura', 'Servidores AWS', '2024-02-15'),
  (1, 'despesa', 3200.00, 'Salários', 'Folha de pagamento', '2024-02-29'),
  (1, 'receita', 16200.00, 'Vendas', 'Software + Licenças', '2024-03-08'),
  (1, 'despesa', 1200.00, 'Administrativo', 'Aluguel escritório', '2024-03-10'),
  (1, 'despesa', 3200.00, 'Salários', 'Folha de pagamento', '2024-03-31'),
  (1, 'receita', 16200.00, 'Vendas', 'Consultoria + Licenças', '2024-04-12'),
  (1, 'despesa', 4500.00, 'Marketing', 'Campanha Digital Q2', '2024-04-20'),
  (1, 'despesa', 3200.00, 'Salários', 'Folha de pagamento', '2024-04-30'),
  (1, 'receita', 22200.00, 'Vendas', 'ERP + Suporte', '2024-05-10'),
  (1, 'despesa', 2800.00, 'Infraestrutura', 'Upgrade servidores', '2024-05-15'),
  (1, 'despesa', 3200.00, 'Salários', 'Folha de pagamento', '2024-05-31');

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para demo (anon key)
CREATE POLICY "Allow all for demo" ON vendas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON financeiro FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON relatorios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for demo" ON empresas FOR ALL USING (true) WITH CHECK (true);
