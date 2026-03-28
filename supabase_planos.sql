-- ============================================================
-- supabase_planos.sql
-- Execute no SQL Editor do Supabase
-- Adiciona controle de plano e assinatura à tabela perfis
-- ============================================================

-- 1. Garante que a tabela perfis tem as colunas necessárias
ALTER TABLE perfis
  ADD COLUMN IF NOT EXISTS plano        TEXT NOT NULL DEFAULT 'starter'
    CHECK (plano IN ('starter','pro','business')),
  ADD COLUMN IF NOT EXISTS plano_ativo  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS assinatura_id TEXT,
  ADD COLUMN IF NOT EXISTS plano_expira TIMESTAMPTZ;

-- 2. Quem está no plano starter NÃO tem plano_ativo = true
--    Quem pagou terá plano_ativo = true via webhook do Mercado Pago

-- 3. Função para verificar se o usuário tem acesso a um plano
CREATE OR REPLACE FUNCTION tem_acesso(user_id UUID, plano_requerido TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  perfil perfis%ROWTYPE;
BEGIN
  SELECT * INTO perfil FROM perfis WHERE id = user_id;

  -- Sem perfil = sem acesso
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Admin sempre tem acesso
  IF perfil.role = 'admin' THEN RETURN TRUE; END IF;

  -- Plano starter = acesso básico (sem pagamento)
  IF plano_requerido = 'starter' THEN RETURN TRUE; END IF;

  -- Pro e Business precisam de plano_ativo = true
  IF NOT perfil.plano_ativo THEN RETURN FALSE; END IF;

  -- Verifica expiração
  IF perfil.plano_expira IS NOT NULL AND perfil.plano_expira < NOW() THEN
    RETURN FALSE;
  END IF;

  -- Verifica hierarquia: business >= pro
  IF plano_requerido = 'pro' THEN
    RETURN perfil.plano IN ('pro', 'business');
  END IF;

  IF plano_requerido = 'business' THEN
    RETURN perfil.plano = 'business';
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. View para o admin ver status de assinaturas
CREATE OR REPLACE VIEW admin_assinaturas AS
SELECT
  id, email, nome, plano, plano_ativo,
  assinatura_id, plano_expira, criado_em
FROM perfis
WHERE role = 'user'
ORDER BY criado_em DESC;