-- Remover a view existente
DROP VIEW IF EXISTS public.profiles_public;

-- Recriar sem security_invoker (usa SECURITY DEFINER por padrao)
CREATE VIEW public.profiles_public AS
SELECT 
  id,
  name,
  username,
  avatar_url
FROM public.profiles;

-- Garantir que usuarios autenticados possam acessar
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;