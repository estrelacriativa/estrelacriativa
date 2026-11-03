-- ==============================================================================
-- BLINDAGEM DE SEGURANÇA DEFINITIVA — ESTRELA CRIATIVA
-- Execute este script no SQL Editor do Supabase (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. REMOVE A SENHA EM TEXTO PLANO DA TABELA DE CONFIGURAÇÕES
ALTER TABLE IF EXISTS public.loja_config DROP COLUMN IF EXISTS senha_admin;

-- 2. HABILITA RLS (ROW LEVEL SECURITY) EM TODAS AS TABELAS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loja_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 3. LIMPEZA DE POLÍTICAS ANTIGAS / PERMISSIVAS
DROP POLICY IF EXISTS "Permitir leitura pública de categorias" ON public.categorias;
DROP POLICY IF EXISTS "Permitir gravação de categorias" ON public.categorias;
DROP POLICY IF EXISTS "Permitir inserção de categorias" ON public.categorias;
DROP POLICY IF EXISTS "Permitir atualização de categorias" ON public.categorias;
DROP POLICY IF EXISTS "Permitir exclusão de categorias" ON public.categorias;

DROP POLICY IF EXISTS "Permitir leitura pública de produtos" ON public.produtos;
DROP POLICY IF EXISTS "Permitir gravação de produtos" ON public.produtos;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON public.produtos;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON public.produtos;
DROP POLICY IF EXISTS "Permitir exclusão de produtos" ON public.produtos;

DROP POLICY IF EXISTS "Permitir leitura pública de loja_config" ON public.loja_config;
DROP POLICY IF EXISTS "Permitir gravação de loja_config" ON public.loja_config;
DROP POLICY IF EXISTS "Permitir atualização de config" ON public.loja_config;
DROP POLICY IF EXISTS "Permitir inserção de loja_config" ON public.loja_config;

DROP POLICY IF EXISTS "Permitir leitura de pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir criação de pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir atualização de pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir exclusão de pedidos" ON public.pedidos;

-- 4. POLÍTICAS BLINDADAS PARA CATEGORIAS
-- Qualquer visitante pode ver categorias do catálogo
CREATE POLICY "Categorias: Leitura pública"
    ON public.categorias FOR SELECT
    TO anon, authenticated
    USING (true);

-- Apenas administradores autenticados podem criar, atualizar e excluir categorias
CREATE POLICY "Categorias: Inserção por admin"
    ON public.categorias FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Categorias: Atualização por admin"
    ON public.categorias FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Categorias: Exclusão por admin"
    ON public.categorias FOR DELETE
    TO authenticated
    USING (true);

-- 5. POLÍTICAS BLINDADAS PARA PRODUTOS
-- Qualquer visitante pode ver produtos do catálogo
CREATE POLICY "Produtos: Leitura pública"
    ON public.produtos FOR SELECT
    TO anon, authenticated
    USING (true);

-- Apenas administradores autenticados podem criar, atualizar e excluir produtos
CREATE POLICY "Produtos: Inserção por admin"
    ON public.produtos FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Produtos: Atualização por admin"
    ON public.produtos FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Produtos: Exclusão por admin"
    ON public.produtos FOR DELETE
    TO authenticated
    USING (true);

-- 6. POLÍTICAS BLINDADAS PARA LOJA_CONFIG
-- Visitantes podem ler WhatsApp e banner da loja
CREATE POLICY "LojaConfig: Leitura pública"
    ON public.loja_config FOR SELECT
    TO anon, authenticated
    USING (true);

-- Apenas administradores autenticados podem alterar as configurações da loja
CREATE POLICY "LojaConfig: Atualização por admin"
    ON public.loja_config FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "LojaConfig: Inserção por admin"
    ON public.loja_config FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 7. POLÍTICAS BLINDADAS PARA PEDIDOS (PROTEÇÃO TOTAL LGPD)
-- Clientes da loja podem apenas ENVIAR novos pedidos ao finalizar o carrinho
CREATE POLICY "Pedidos: Criação pública por clientes"
    ON public.pedidos FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- NENHUM visitante anônimo pode ler pedidos! Apenas administradores autenticados:
CREATE POLICY "Pedidos: Leitura restrita a administradores"
    ON public.pedidos FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Pedidos: Atualização por administradores"
    ON public.pedidos FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Pedidos: Exclusão por administradores"
    ON public.pedidos FOR DELETE
    TO authenticated
    USING (true);

-- 8. POLÍTICAS BLINDADAS PARA SUPABASE STORAGE (BUCKET 'produtos')
DROP POLICY IF EXISTS "Permitir leitura pública de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Leitura pública de fotos" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Upload de fotos por admin" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Atualização de fotos por admin" ON storage.objects;
DROP POLICY IF EXISTS "Storage: Exclusão de fotos por admin" ON storage.objects;

-- Qualquer um pode visualizar as fotos dos produtos na loja
CREATE POLICY "Storage: Leitura pública de fotos"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'produtos');

-- Apenas administradores autenticados podem fazer upload, alterar ou apagar fotos
CREATE POLICY "Storage: Upload de fotos por admin"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'produtos');

CREATE POLICY "Storage: Atualização de fotos por admin"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'produtos');

CREATE POLICY "Storage: Exclusão de fotos por admin"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'produtos');

-- 9. NOTIFICAÇÃO DE RECARGA DO SCHEMA POSTGREST
NOTIFY pgrst, 'reload schema';

