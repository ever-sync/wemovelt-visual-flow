

# Plano: Tela de Super Admin

## Resumo

Criar um painel de administracao completo para o Super Admin gerenciar:
- Exercicios/Equipamentos (nome, descricao, link do video, categoria, dificuldade)
- Academias (nome, endereco, localizacao GPS, raio de check-in)
- Vinculacao de equipamentos a academias

A implementacao seguira as melhores praticas de seguranca com verificacao de roles via servidor.

---

## 1. Arquitetura de Seguranca

### 1.1 Sistema de Roles no Banco de Dados

```sql
-- Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Criar tabela de roles separada (NUNCA no profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Funcao SECURITY DEFINER para verificar role (evita recursao)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Politica: apenas admins podem ver roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Politica: apenas admins podem gerenciar roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### 1.2 RLS para Equipamentos e Academias

```sql
-- Admins podem inserir/atualizar/deletar equipamentos
CREATE POLICY "Admins can manage equipment"
ON public.equipment FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem inserir/atualizar/deletar academias
CREATE POLICY "Admins can manage gyms"
ON public.gyms FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

---

## 2. Estrutura de Arquivos

### Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/Admin.tsx` | Pagina principal do painel admin |
| `src/components/admin/AdminEquipmentTab.tsx` | Tab de gerenciamento de equipamentos |
| `src/components/admin/AdminGymsTab.tsx` | Tab de gerenciamento de academias |
| `src/components/admin/EquipmentForm.tsx` | Formulario de criacao/edicao de equipamento |
| `src/components/admin/GymForm.tsx` | Formulario de criacao/edicao de academia |
| `src/components/AdminRoute.tsx` | Componente de protecao de rota para admin |
| `src/hooks/useUserRole.ts` | Hook para verificar role do usuario |
| `src/hooks/useAdminEquipment.ts` | Hook com mutations para equipamentos |
| `src/hooks/useAdminGyms.ts` | Hook com mutations para academias |

### Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/App.tsx` | Adicionar rota /admin |
| `src/contexts/AuthContext.tsx` | Adicionar isAdmin e checkRole |

---

## 3. Componentes da Interface

### 3.1 Pagina Admin (`src/pages/Admin.tsx`)

Layout com abas para:
- Equipamentos
- Academias
- (Futuro: Usuarios, Relatorios)

```text
+----------------------------------+
|  [<] WEMOVELT Admin              |
+----------------------------------+
|  [Equipamentos] [Academias]      |
+----------------------------------+
|                                  |
|  Lista de items com acoes:       |
|  - Editar                        |
|  - Excluir                       |
|  - Vincular (para equipamentos)  |
|                                  |
|  [+ Novo]                        |
+----------------------------------+
```

### 3.2 Tab de Equipamentos

Funcionalidades:
- Listar todos os equipamentos com filtros por categoria
- Criar novo equipamento (nome, descricao, video_url, categoria, dificuldade)
- Editar equipamento existente
- Excluir equipamento
- Vincular equipamento a uma academia (selecionar gym_id)

### 3.3 Tab de Academias

Funcionalidades:
- Listar todas as academias
- Criar nova academia (nome, endereco, lat, lng, radius)
- Editar academia existente
- Excluir academia
- Mapa interativo para selecionar localizacao (opcional)

### 3.4 Formulario de Equipamento

Campos:
- Nome (obrigatorio)
- Descricao (textarea)
- Link do Video (URL do YouTube)
- Categoria (select: peito, costas, pernas, bracos, ombros, abdomen)
- Dificuldade (select: beginner, intermediate, advanced)
- Academia (select com lista de academias)
- Musculos trabalhados (multi-select)

### 3.5 Formulario de Academia

Campos:
- Nome (obrigatorio)
- Endereco (texto)
- Latitude (numero)
- Longitude (numero)
- Raio de check-in em metros (numero, default: 50)
- Imagem (URL ou upload)

---

## 4. Hooks de Administracao

### 4.1 useUserRole

```typescript
// src/hooks/useUserRole.ts
export const useUserRole = () => {
  const { user } = useAuth();
  
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      // Chama funcao no banco que verifica role
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user!.id, _role: 'admin' });
      
      if (error) return false;
      return data as boolean;
    },
    enabled: !!user,
  });
  
  return { isAdmin: isAdmin ?? false, isLoading };
};
```

### 4.2 useAdminEquipment

```typescript
// src/hooks/useAdminEquipment.ts
export const useAdminEquipment = () => {
  const queryClient = useQueryClient();
  
  const createEquipment = useMutation({
    mutationFn: async (data: CreateEquipmentData) => {
      const { error } = await supabase
        .from("equipment")
        .insert(data);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["equipment"] }),
  });
  
  const updateEquipment = useMutation({
    mutationFn: async ({ id, ...data }: UpdateEquipmentData) => {
      const { error } = await supabase
        .from("equipment")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["equipment"] }),
  });
  
  const deleteEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("equipment")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["equipment"] }),
  });
  
  return { createEquipment, updateEquipment, deleteEquipment };
};
```

### 4.3 useAdminGyms

Similar ao useAdminEquipment, com mutations para:
- createGym
- updateGym
- deleteGym

---

## 5. Rota Protegida para Admin

### 5.1 AdminRoute Component

```typescript
// src/components/AdminRoute.tsx
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAdmin, isLoading } = useUserRole();
  
  if (loading || isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};
```

### 5.2 Rota no App.tsx

```typescript
<Route path="/admin" element={
  <AdminRoute>
    <Admin />
  </AdminRoute>
} />
```

---

## 6. Migracao SQL Completa

```sql
-- 1. Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 3. Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Funcao de verificacao de role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Politicas de user_roles
CREATE POLICY "Admins can view roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Politicas de equipamentos para admins
CREATE POLICY "Admins can insert equipment"
ON public.equipment FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update equipment"
ON public.equipment FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete equipment"
ON public.equipment FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Politicas de academias para admins
CREATE POLICY "Admins can insert gyms"
ON public.gyms FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gyms"
ON public.gyms FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gyms"
ON public.gyms FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

---

## 7. Fluxo de Acesso ao Admin

```text
Usuario acessa /admin
        |
        v
+----------------+
| AdminRoute     |
| verifica auth  |
+----------------+
        |
  Logado? ----No----> Redireciona para /
        |
       Yes
        |
        v
+----------------+
| useUserRole    |
| verifica role  |
| (via servidor) |
+----------------+
        |
  isAdmin? ---No----> Redireciona para /home
        |                (sem acesso)
       Yes
        |
        v
+----------------+
| Pagina Admin   |
| (acesso total) |
+----------------+
```

---

## 8. Ordem de Implementacao

1. Migracao SQL - Criar tabela user_roles, funcao has_role e politicas RLS
2. Hook useUserRole - Verificacao de role via servidor
3. AdminRoute - Componente de protecao de rota
4. Pagina Admin - Layout com tabs
5. useAdminEquipment - Mutations de equipamentos
6. AdminEquipmentTab - Lista e acoes de equipamentos
7. EquipmentForm - Formulario de equipamento
8. useAdminGyms - Mutations de academias
9. AdminGymsTab - Lista e acoes de academias
10. GymForm - Formulario de academia
11. App.tsx - Adicionar rota /admin

---

## 9. Consideracoes de Seguranca

| Aspecto | Implementacao |
|---------|---------------|
| Roles em tabela separada | Evita escalonamento de privilegios |
| SECURITY DEFINER | Evita recursao em RLS |
| Verificacao no servidor | Nunca confia em localStorage |
| RLS em todas as operacoes | Dupla camada de seguranca |
| Rota protegida no frontend | UX - nao mostra UI de admin para nao-admins |

---

## 10. Primeiro Admin

Apos implementacao, sera necessario inserir o primeiro admin manualmente:

```sql
-- Substitua pelo UUID do seu usuario
INSERT INTO public.user_roles (user_id, role)
VALUES ('seu-user-id-aqui', 'admin');
```

Depois, o admin pode gerenciar outros admins pela interface.

---

## 11. Resultado Esperado

Apos implementacao:
1. Rota /admin acessivel apenas para usuarios com role 'admin'
2. Super Admin pode criar/editar/excluir equipamentos com video e descricao
3. Super Admin pode criar/editar/excluir academias com localizacao
4. Super Admin pode vincular equipamentos a academias especificas
5. Sistema de roles escalavel para futuras funcionalidades (moderadores, etc)

