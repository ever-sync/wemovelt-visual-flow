
# FASE 1: Integração Supabase Externo + Autenticação Real

## Visão Geral

Conectar o app WEMOVELT a um projeto Supabase externo, criar a estrutura de banco de dados e implementar autenticação real substituindo o sistema visual mockado atual.

---

## Pré-requisitos (Você precisa fazer)

Antes de iniciar a implementação, você precisa:

1. **Criar um projeto no Supabase** (https://supabase.com)
2. **Obter as credenciais:**
   - Project URL (ex: `https://xxxx.supabase.co`)
   - Anon Key (chave pública)
3. **Configurar no Lovable:**
   - Vá em Settings > Connectors > Supabase
   - Conecte seu projeto Supabase externo

---

## Etapa 1: Estrutura do Banco de Dados

### Tabelas a criar (SQL para rodar no Supabase)

```sql
-- 1. Perfis de usuário (vinculado ao auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  goal TEXT,
  experience_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Academias
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  radius INTEGER DEFAULT 50,
  image_url TEXT,
  equipment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Equipamentos
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  muscles TEXT[],
  difficulty TEXT,
  video_url TEXT,
  image_url TEXT,
  qr_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Check-ins
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id),
  equipment_id UUID REFERENCES equipment(id),
  method TEXT NOT NULL,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Políticas de Segurança (RLS)

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário só acessa próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Gyms: todos podem ver (público)
CREATE POLICY "Anyone can view gyms"
  ON gyms FOR SELECT
  TO authenticated
  USING (true);

-- Equipment: todos podem ver (público)
CREATE POLICY "Anyone can view equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (true);

-- Check-ins: usuário só acessa próprios check-ins
CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Dados iniciais das academias

```sql
INSERT INTO gyms (name, address, lat, lng, radius, image_url, equipment_count) VALUES
  ('WEMOVELT Zona Sul', 'Av. Santo Amaro, 1234', -23.6245, -46.6634, 50, '/placeholder.svg', 25),
  ('WEMOVELT Zona Norte', 'Av. Caetano Álvares, 567', -23.5089, -46.6280, 50, '/placeholder.svg', 30),
  ('WEMOVELT Zona Leste', 'Av. Aricanduva, 890', -23.5428, -46.4747, 50, '/placeholder.svg', 28),
  ('WEMOVELT Zona Oeste', 'Av. Francisco Morato, 432', -23.5834, -46.7320, 50, '/placeholder.svg', 22),
  ('WEMOVELT Centro', 'Av. Paulista, 1000', -23.5614, -46.6558, 50, '/placeholder.svg', 35);
```

---

## Etapa 2: Integração Supabase no Frontend

### Arquivos a criar

| Arquivo | Descrição |
|---------|-----------|
| `src/integrations/supabase/client.ts` | Cliente Supabase configurado |
| `src/integrations/supabase/types.ts` | Tipos TypeScript das tabelas |
| `src/contexts/AuthContext.tsx` | Contexto de autenticação global |
| `src/hooks/useAuth.ts` | Hook para usar autenticação |
| `src/pages/Auth.tsx` | Página dedicada de login/cadastro |

### Fluxo de autenticação

```text
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE AUTENTICAÇÃO                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Usuário acessa /]                                         │
│         ↓                                                   │
│  [Verifica sessão via onAuthStateChange]                    │
│         ↓                                                   │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  SEM SESSÃO     │    │  COM SESSÃO     │                │
│  │                 │    │                 │                │
│  │ • Mostra Welcome│    │ • Redirect /home│                │
│  │ • Botões Login/ │    │ • Carrega perfil│                │
│  │   Cadastro      │    │                 │                │
│  └────────┬────────┘    └─────────────────┘                │
│           ↓                                                 │
│  [Abre modal ou vai para /auth]                            │
│           ↓                                                 │
│  [Supabase Auth (email/senha)]                             │
│           ↓                                                 │
│  [Sucesso → Redirect /home]                                │
│  [Erro → Mostra mensagem]                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Etapa 3: Componentes de Autenticação

### AuthModal atualizado

Modificações no modal existente:
- Adicionar estados para email, password, name
- Integrar com `supabase.auth.signUp()` e `supabase.auth.signInWithPassword()`
- Validação com Zod (email válido, senha mínima 6 caracteres)
- Tratamento de erros amigáveis
- Loading state durante requisições
- Link "Esqueci minha senha" funcional com `supabase.auth.resetPasswordForEmail()`

### Proteção de rotas

Criar componente `ProtectedRoute` que:
- Verifica se usuário está autenticado
- Redireciona para `/` se não estiver
- Mostra loading enquanto verifica

### Logout

Adicionar botão de logout no MenuDrawer:
- Chamar `supabase.auth.signOut()`
- Limpar estado local
- Redirecionar para `/`

---

## Etapa 4: Arquivos a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/App.tsx` | Envolver com AuthProvider, adicionar ProtectedRoute |
| `src/components/modals/AuthModal.tsx` | Integrar Supabase Auth real |
| `src/pages/Welcome.tsx` | Verificar sessão existente e redirecionar |
| `src/components/modals/MenuDrawer.tsx` | Adicionar logout funcional |
| `src/components/modals/ProfileModal.tsx` | Carregar/salvar dados do Supabase |

---

## Etapa 5: Detalhes Técnicos

### Estrutura de pastas final

```text
src/
├── contexts/
│   └── AuthContext.tsx          # Provider de autenticação
├── hooks/
│   ├── useAuth.ts               # Hook de autenticação
│   └── useCheckIn.ts            # (existente)
├── integrations/
│   └── supabase/
│       ├── client.ts            # Cliente Supabase
│       └── types.ts             # Tipos das tabelas
├── components/
│   ├── ProtectedRoute.tsx       # Proteção de rotas
│   └── modals/
│       └── AuthModal.tsx        # (modificar)
└── pages/
    ├── Auth.tsx                 # Página de auth (opcional)
    └── Welcome.tsx              # (modificar)
```

### Validação com Zod

```typescript
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Nome muito curto"),
});
```

### Tratamento de erros

| Código Supabase | Mensagem para usuário |
|-----------------|----------------------|
| `user_already_exists` | "Este e-mail já está cadastrado" |
| `invalid_credentials` | "E-mail ou senha incorretos" |
| `email_not_confirmed` | "Confirme seu e-mail para continuar" |
| `weak_password` | "Senha muito fraca, use pelo menos 6 caracteres" |

---

## Configurações no Supabase Dashboard

Após conectar, você precisa configurar no painel do Supabase:

1. **Authentication > URL Configuration:**
   - Site URL: URL do seu app (preview ou produção)
   - Redirect URLs: Adicionar URLs permitidas

2. **Authentication > Email Templates** (opcional):
   - Personalizar e-mails em português

3. **Authentication > Providers:**
   - Email/Password já vem habilitado
   - (Opcional) Habilitar Google, Apple, etc.

4. **Desabilitar "Confirm email"** para testes:
   - Authentication > Providers > Email
   - Desmarcar "Confirm email"

---

## Ordem de Implementação

1. **Conectar Supabase** ao projeto Lovable
2. **Criar tabelas** via SQL Editor no Supabase
3. **Criar cliente e tipos** (`src/integrations/supabase/`)
4. **Criar AuthContext** com gerenciamento de sessão
5. **Atualizar AuthModal** com login/cadastro real
6. **Criar ProtectedRoute** para proteger páginas
7. **Atualizar App.tsx** com providers e rotas protegidas
8. **Atualizar ProfileModal** para persistir dados
9. **Testar fluxos** de login, cadastro, logout e perfil

---

## Resultado Esperado

Após a implementação:
- Login e cadastro funcionais com Supabase
- Sessão persistente (usuário logado ao recarregar)
- Perfil salvo no banco de dados
- Rotas protegidas (Home, Treinos, etc.)
- Logout funcional
- Mensagens de erro amigáveis
