-- ============================================================
-- AutoReport AI — Sistema de Admin
-- Execute este script no SQL Editor do Supabase
-- APÓS ter rodado o supabase_setup.sql
-- ============================================================

-- ── 1. TABELA: perfis de usuário ────────────────────────────
-- Espelha auth.users com dados extras (role, plano, status)
CREATE TABLE IF NOT EXISTS perfis (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  nome        TEXT,
  empresa     TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plano       TEXT NOT NULL DEFAULT 'starter' CHECK (plano IN ('starter', 'pro', 'business')),
  status      TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  ultimo_login TIMESTAMPTZ,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. FUNÇÃO: criar perfil automaticamente ao cadastrar ────
-- Dispara quando um novo usuário é criado no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, email, nome, empresa, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'empresa', ''),
    -- SEU EMAIL = admin automaticamente
    CASE WHEN NEW.email = 'admin@empresa.com' THEN 'admin' ELSE 'user' END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. TRIGGER: dispara a função acima ──────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 4. FUNÇÃO: atualizar ultimo_login ───────────────────────
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.perfis
  SET ultimo_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 5. TRIGGER: atualiza login em auth.sessions ─────────────
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.sessions;
CREATE TRIGGER on_auth_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

-- ── 6. ROW LEVEL SECURITY ───────────────────────────────────
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seu próprio perfil
CREATE POLICY "user_see_own" ON perfis
  FOR SELECT USING (auth.uid() = id);

-- Usuário atualiza apenas seu próprio perfil
CREATE POLICY "user_update_own" ON perfis
  FOR UPDATE USING (auth.uid() = id);

-- Admin vê TODOS os perfis (usa service_role key na API)
-- Isso é controlado pela API route /api/admin que usa SERVICE_ROLE_KEY

-- ── 7. DEFINIR SEU EMAIL COMO ADMIN ─────────────────────────
-- IMPORTANTE: substitua pelo seu email real antes de rodar!
-- Se você já tem conta criada, rode este UPDATE manualmente:
UPDATE perfis SET role = 'admin'
WHERE email = 'helberthrenan@icloud.com';

-- ── 8. VIEW: estatísticas para o dashboard admin ────────────
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  COUNT(*)                                          AS total_usuarios,
  COUNT(*) FILTER (WHERE status = 'ativo')          AS usuarios_ativos,
  COUNT(*) FILTER (WHERE plano = 'pro')             AS plano_pro,
  COUNT(*) FILTER (WHERE plano = 'business')        AS plano_business,
  COUNT(*) FILTER (WHERE plano = 'starter')         AS plano_starter,
  COUNT(*) FILTER (
    WHERE criado_em >= NOW() - INTERVAL '30 days'
  )                                                 AS novos_30d,
  COUNT(*) FILTER (
    WHERE ultimo_login >= NOW() - INTERVAL '7 days'
  )                                                 AS ativos_7d
FROM perfis
WHERE role = 'user';