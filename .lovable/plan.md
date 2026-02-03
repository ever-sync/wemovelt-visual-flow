
# Plano: Corrigir Visualizacao de Nome e Foto na Timeline

## Problema Identificado

A view `profiles_public` foi criada com `security_invoker=on`, o que faz com que ela herde as politicas RLS da tabela base `profiles`. Como a tabela profiles tem a politica:

```sql
"Users can view own profile" - USING (auth.uid() = id)
```

Quando um usuario tenta ver o perfil de **outro** usuario na timeline, a consulta retorna vazio porque a RLS bloqueia o acesso.

### Evidencia

Requisicao na timeline:
```
GET profiles_public?id=in.(0621ecca-bc12-4c59-aa23-f316337f9d65)
Response: [] (vazio)
```

Mas os dados existem:
```
SELECT * FROM profiles_public → 3 registros encontrados
```

A diferenca e que a query de debug usa service role (bypassa RLS), enquanto o frontend usa anon key (respeita RLS).

---

## Solucao

Recriar a view `profiles_public` **SEM** `security_invoker` para que ela seja acessivel publicamente, ja que contem apenas dados nao sensiveis (nome, username, avatar).

### SQL Necessario

```sql
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
```

---

## Por que e Seguro

A view `profiles_public` expoe apenas:
- `id` - UUID publico
- `name` - Nome de exibicao
- `username` - Handle publico
- `avatar_url` - URL da foto

Dados sensiveis como `weight`, `age`, `height`, `goal` permanecem protegidos na tabela `profiles` original.

---

## Resultado Esperado

Apos a correcao:
- Timeline mostra nome e foto de todos os usuarios
- Card de post exibe avatar ou inicial
- Dados sensiveis continuam protegidos

---

## Arquivos Impactados

| Tipo | Acao |
|------|------|
| Database View | Recriar `profiles_public` sem security_invoker |
| Codigo | Nenhuma alteracao necessaria |

