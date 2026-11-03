-- ==============================================================================
-- BLINDAGEM DE SEGURANÇA MÁXIMA DEFINITIVA — ESTRELA CRIATIVA
-- Exclusiva para: ataiseevangelista@gmail.com
-- Execute este script no SQL Editor do Supabase (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. FUNÇÃO DE VERIFICAÇÃO DE ADMINISTRADORA
-- Apenas e estritamente o e-mail 'ataiseevangelista@gmail.com' tem poder de administração
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated' AND
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'ataiseevangelista@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. REMOVE A SENHA EM TEXTO PLANO DA TABELA DE CONFIGURAÇÕES
ALTER TABLE IF EXISTS public.loja_config DROP COLUMN IF EXISTS senha_admin;

-- 3. HABILITA RLS (ROW LEVEL SECURITY) EM TODAS AS TABELAS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loja_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 4. LIMPEZA DE POLÍTICAS ANTERIORES
DROP POLICY IF EXISTS "Categorias: Leitura pública" ON public.categorias;
DROP POLICY IF EXISTS "Categorias: Inserção por admin" ON public.categorias;
DROP POLICY IF EXISTS "Categorias: Atualização por admin" ON public.categorias;
DROP POLICY IF EXISTS "Categorias: Exclusão por admin" ON public.categorias;
DROP POLICY IF EXISTS "Permitir leitura pública de categorias" ON public.categorias;
DROP POLICY IF EXISTS "Permitir gravação de categorias" ON public.categorias;

DROP POLICY IF EXISTS "Produtos: Leitura pública" ON public.produtos;
DROP POLICY IF EXISTS "Produtos: Inserção por admin" ON public.produtos;
DROP POLICY IF EXISTS "Produtos: Atualização por admin" ON public.produtos;
DROP POLICY IF EXISTS "Produtos: Exclusão por admin" ON public.produtos;
DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON public.produtos;
DROP POLICY IF EXISTS "Permitir gravação de produtos" ON public.produtos;

DROP POLICY IF EXISTS "LojaConfig: Leitura pública" ON public.loja_config;
DROP POLICY IF EXISTS "LojaConfig: Inserção por admin" ON public.loja_config;
DROP POLICY IF EXISTS "LojaConfig: Atualização por admin" ON public.loja_config;
DROP POLICY IF EXISTS "Permitir leitura pública de loja_config" ON public.loja_config;
DROP POLICY IF EXISTS "Permitir gravação de loja_config" ON public.loja_config;

DROP POLICY IF EXISTS "Pedidos: Criação pública por clientes" ON public.pedidos;
DROP POLICY IF EXISTS "Pedidos: Leitura restrita a administradores" ON public.pedidos;
DROP POLICY IF EXISTS "Pedidos: Atualização por administradores" ON public.pedidos;
DROP POLICY IF EXISTS "Pedidos: Exclusão por administradores" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir leitura de pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir criação de pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir atualização de pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir exclusão de pedidos" ON public.pedidos;

-- 5. POLÍTICAS PARA CATEGORIAS
CREATE POLICY "Categorias: Leitura pública"
    ON public.categorias FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Categorias: Inserção por admin"
    ON public.categorias FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Categorias: Atualização por admin"
    ON public.categorias FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Categorias: Exclusão por admin"
    ON public.categorias FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 6. POLÍTICAS PARA PRODUTOS
CREATE POLICY "Produtos: Leitura pública"
    ON public.produtos FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Produtos: Inserção por admin"
    ON public.produtos FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Produtos: Atualização por admin"
    ON public.produtos FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Produtos: Exclusão por admin"
    ON public.produtos FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 7. POLÍTICAS PARA LOJA_CONFIG
CREATE POLICY "LojaConfig: Leitura pública"
    ON public.loja_config FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "LojaConfig: Inserção por admin"
    ON public.loja_config FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "LojaConfig: Atualização por admin"
    ON public.loja_config FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 8. POLÍTICAS PARA PEDIDOS (PROTEÇÃO LGPD)
-- Clientes podem apenas enviar novos pedidos
CREATE POLICY "Pedidos: Criação pública por clientes"
    ON public.pedidos FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- APENAS ataiseevangelista@gmail.com pode visualizar, gerenciar ou apagar pedidos
CREATE POLICY "Pedidos: Leitura restrita à Ataíse"
    ON public.pedidos FOR SELECT
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "Pedidos: Atualização restrita à Ataíse"
    ON public.pedidos FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Pedidos: Exclusão restrita à Ataíse"
    ON public.pedidos FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 9. POLÍTICAS DE STORAGE (BUCKET 'produtos')
DROP POLICY IF EXISTS "Permitir leitura pública de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Leitura pública de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Upload de fotos por admin" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Atualização de fotos por admin" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Exclusão de fotos por admin" ON storage.objects;

CREATE POLICY "Storage: Leitura pública de fotos"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'produtos');

CREATE POLICY "Storage: Upload de fotos restrito à Ataíse"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'produtos' AND public.is_admin());

CREATE POLICY "Storage: Atualização de fotos restrita à Ataíse"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'produtos' AND public.is_admin());

CREATE POLICY "Storage: Exclusão de fotos restrita à Ataíse"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'produtos' AND public.is_admin());

-- 10. RECARREGA SCHEMA NO POSTGREST
NOTIFY pgrst, 'reload schema';
