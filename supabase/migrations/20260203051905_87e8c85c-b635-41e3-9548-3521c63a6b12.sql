-- Corrigir RLS de profiles para permitir visualização em funcionalidades sociais
-- A tabela profiles não contém dados altamente sensíveis (sem senhas, tokens)
-- age/weight/height são opcionais e o usuário escolhe compartilhar

-- Remover política restritiva atual
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Criar política que permite usuários autenticados verem perfis para funcionalidades sociais
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Manter políticas de INSERT e UPDATE apenas para o próprio usuário (já existentes)