-- ============================================================
-- supabase_rls_seguro.sql
-- Execute no SQL Editor do Supabase
-- Substitui as políticas permissivas de demo por RLS real.
-- Cada usuário só acessa dados da sua própria empresa.
-- ============================================================

-- ── 1. REMOVE políticas permissivas do demo ──────────────────
DROP POLICY IF EXISTS "Allow all for demo" ON vendas;
DROP POLICY IF EXISTS "Allow all for demo" ON financeiro;
DROP POLICY IF EXISTS "Allow all for demo" ON relatorios;
DROP POLICY IF EXISTS "Allow all for demo" ON empresas;

-- ── 2. FUNÇÃO auxiliar: retorna empresa_id do usuário logado ─
-- Usada nas políticas abaixo para evitar subquery repetida
CREATE OR REPLACE FUNCTION minha_empresa_id()
RETURNS BIGINT AS $$
  SELECT empresa_id
  FROM perfis
  WHERE id = auth.uid()
  LIMIT 1
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── 3. POLÍTICAS para tabela VENDAS ─────────────────────────
CREATE POLICY "vendas_select" ON vendas
  FOR SELECT USING (empresa_id = minha_empresa_id());

CREATE POLICY "vendas_insert" ON vendas
  FOR INSERT WITH CHECK (empresa_id = minha_empresa_id());

CREATE POLICY "vendas_update" ON vendas
  FOR UPDATE USING (empresa_id = minha_empresa_id())
  WITH CHECK (empresa_id = minha_empresa_id());

CREATE POLICY "vendas_delete" ON vendas
  FOR DELETE USING (empresa_id = minha_empresa_id());

-- ── 4. POLÍTICAS para tabela FINANCEIRO ─────────────────────
CREATE POLICY "financeiro_select" ON financeiro
  FOR SELECT USING (empresa_id = minha_empresa_id());

CREATE POLICY "financeiro_insert" ON financeiro
  FOR INSERT WITH CHECK (empresa_id = minha_empresa_id());

CREATE POLICY "financeiro_update" ON financeiro
  FOR UPDATE USING (empresa_id = minha_empresa_id())
  WITH CHECK (empresa_id = minha_empresa_id());

CREATE POLICY "financeiro_delete" ON financeiro
  FOR DELETE USING (empresa_id = minha_empresa_id());

-- ── 5. POLÍTICAS para tabela RELATORIOS ─────────────────────
CREATE POLICY "relatorios_select" ON relatorios
  FOR SELECT USING (empresa_id = minha_empresa_id());

CREATE POLICY "relatorios_insert" ON relatorios
  FOR INSERT WITH CHECK (empresa_id = minha_empresa_id());

CREATE POLICY "relatorios_delete" ON relatorios
  FOR DELETE USING (empresa_id = minha_empresa_id());

-- ── 6. POLÍTICAS para tabela EMPRESAS ───────────────────────
-- Usuário só vê sua própria empresa
CREATE POLICY "empresas_select" ON empresas
  FOR SELECT USING (id = minha_empresa_id());

-- ── 7. POLÍTICAS para tabela PERFIS ─────────────────────────
-- Já existe policy "user_see_own" do supabase_admin.sql
-- Garante que está ativa:
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- ── 8. TRIGGER: cria empresa automaticamente ao cadastrar ────
-- Quando um usuário se registra, cria uma empresa para ele
-- e vincula no perfil
CREATE OR REPLACE FUNCTION criar_empresa_para_usuario()
RETURNS TRIGGER AS $$
DECLARE
  nova_empresa_id BIGINT;
BEGIN
  -- Só cria se ainda não tiver empresa_id
  IF NEW.empresa_id IS NULL THEN
    INSERT INTO empresas (nome, email)
    VALUES (
      COALESCE(NEW.nome, split_part(NEW.email, '@', 1)) || ' Empresa',
      NEW.email
    )
    RETURNING id INTO nova_empresa_id;

    UPDATE perfis SET empresa_id = nova_empresa_id WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adiciona coluna empresa_id na tabela perfis se não existir
ALTER TABLE perfis ADD COLUMN IF NOT EXISTS empresa_id BIGINT REFERENCES empresas(id);

DROP TRIGGER IF EXISTS after_perfil_created ON perfis;
CREATE TRIGGER after_perfil_created
  AFTER INSERT ON perfis
  FOR EACH ROW EXECUTE FUNCTION criar_empresa_para_usuario();

-- ── 9. Para usuários já existentes sem empresa ───────────────
-- Execute manualmente se necessário:
-- DO $$
-- DECLARE r RECORD;
-- BEGIN
--   FOR r IN SELECT * FROM perfis WHERE empresa_id IS NULL LOOP
--     INSERT INTO empresas (nome, email) VALUES (r.nome || ' Empresa', r.email)
--     RETURNING id INTO r.empresa_id;
--     UPDATE perfis SET empresa_id = r.empresa_id WHERE id = r.id;
--   END LOOP;
-- END $$;
