
# Fase 6: Comunidade

## Resumo

Esta fase transforma a pagina de comunidade de dados estaticos para um sistema completo com banco de dados, incluindo:
- Posts com upload de imagens
- Sistema de curtidas em tempo real
- Comentarios aninhados
- Feed paginado com scroll infinito

---

## Estado Atual

| Componente | Status | Problema |
|------------|--------|----------|
| Comunidade.tsx | Estatico | Posts hardcoded no codigo |
| PostModal.tsx | UI apenas | Nao salva no banco |
| Upload de imagens | Nao implementado | Botoes sem funcionalidade |
| Curtidas | Local | Usa useState, nao persiste |
| Comentarios | Placeholder | Exibe toast "Em breve" |

---

## 1. Novas Tabelas no Banco de Dados

### 1.1 Tabela: posts

```sql
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ver posts
CREATE POLICY "Anyone authenticated can view posts"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- Usuario pode inserir proprio post
CREATE POLICY "Users can insert own posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuario pode atualizar proprio post
CREATE POLICY "Users can update own posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Usuario pode deletar proprio post
CREATE POLICY "Users can delete own posts"
ON public.posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 1.2 Tabela: post_likes

```sql
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id) -- Evita curtidas duplicadas
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ver curtidas
CREATE POLICY "Anyone authenticated can view likes"
ON public.post_likes FOR SELECT
TO authenticated
USING (true);

-- Usuario pode inserir propria curtida
CREATE POLICY "Users can insert own likes"
ON public.post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuario pode remover propria curtida
CREATE POLICY "Users can delete own likes"
ON public.post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 1.3 Tabela: post_comments

```sql
CREATE TABLE public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE, -- Para respostas
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ver comentarios
CREATE POLICY "Anyone authenticated can view comments"
ON public.post_comments FOR SELECT
TO authenticated
USING (true);

-- Usuario pode inserir proprio comentario
CREATE POLICY "Users can insert own comments"
ON public.post_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuario pode deletar proprio comentario
CREATE POLICY "Users can delete own comments"
ON public.post_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### 1.4 Trigger para atualizar contadores

```sql
-- Funcao para atualizar likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_like_change
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Funcao para atualizar comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_post_comment_change
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();
```

---

## 2. Storage para Imagens de Posts

### Migracao SQL

```sql
-- Criar bucket para imagens de posts
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- Politica: usuarios podem fazer upload de proprias imagens
CREATE POLICY "Users can upload post images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politica: usuarios podem deletar proprias imagens
CREATE POLICY "Users can delete post images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politica: qualquer um pode visualizar imagens (bucket publico)
CREATE POLICY "Anyone can view post images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'post-images');
```

---

## 3. Novos Hooks

### 3.1 Hook: usePosts

Arquivo: `src/hooks/usePosts.ts`

Funcionalidades:
- Carregar posts paginados (10 por vez)
- Criar novo post
- Deletar post
- Toggle curtida
- Verificar se usuario curtiu

```text
usePosts()
  |
  +-> posts: Post[] (com dados do autor)
  +-> isLoading, isFetching
  +-> hasMore: boolean
  +-> fetchNextPage: () => void
  |
  +-> createPost(content, imageFile?)
  +-> deletePost(id)
  +-> toggleLike(postId)
  +-> hasLiked(postId): boolean
```

### 3.2 Hook: useComments

Arquivo: `src/hooks/useComments.ts`

Funcionalidades:
- Carregar comentarios de um post
- Adicionar comentario
- Deletar comentario

```text
useComments(postId)
  |
  +-> comments: Comment[] (com dados do autor)
  +-> isLoading
  +-> addComment(content, parentId?)
  +-> deleteComment(id)
```

---

## 4. Componentes a Criar

### 4.1 PostCard.tsx

Componente reutilizavel para exibir um post:

```text
+------------------------+
| [Avatar] Nome          |
|         @usuario · 2h  |
+------------------------+
| Conteudo do post...    |
|                        |
| [  IMAGEM OPCIONAL  ]  |
|                        |
+------------------------+
| ❤️ 24  💬 5  🔗 Share  |
+------------------------+
```

Props:
- post: Post
- onLike, onComment, onShare
- onDelete (se for autor)

### 4.2 CommentsModal.tsx

Modal para ver e adicionar comentarios:

```text
+------------------------+
|     Comentarios (5)    |
+------------------------+
| [Avatar] Maria         |
| Muito legal! 👏        |
|                2h      |
+------------------------+
| [Avatar] Joao          |
| Parabens pelo treino!  |
|                1h      |
+------------------------+
| [Escreva um comentario]|
| [Enviar]               |
+------------------------+
```

### 4.3 ImageUpload.tsx

Componente generico para upload de imagens (pode ser usado em PostModal):

```text
+------------------------+
|                        |
|  [  PREVIEW/DROPZONE ] |
|                        |
+------------------------+
| [Remover]              |
+------------------------+
```

---

## 5. Refatorar Componentes Existentes

### 5.1 PostModal.tsx

Mudancas:
- Integrar com hook usePosts
- Adicionar upload de imagem funcional
- Exibir dados do usuario logado
- Estado de loading durante criacao

Novo fluxo:
1. Usuario escreve conteudo
2. (Opcional) Seleciona imagem
3. Clica em Publicar
4. Upload da imagem para storage
5. INSERT do post com image_url
6. Atualizar feed

### 5.2 Comunidade.tsx

Mudancas:
- Usar hook usePosts
- Implementar scroll infinito
- Extrair PostCard como componente
- Integrar curtidas reais
- Abrir CommentsModal ao clicar em comentarios

---

## 6. Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/hooks/usePosts.ts` | CRUD de posts com paginacao |
| `src/hooks/useComments.ts` | CRUD de comentarios |
| `src/components/PostCard.tsx` | Card reutilizavel de post |
| `src/components/modals/CommentsModal.tsx` | Modal de comentarios |
| `src/components/ImageUpload.tsx` | Upload de imagem generico |

---

## 7. Arquivos a Modificar

| Arquivo | Mudancas |
|---------|----------|
| `src/pages/Comunidade.tsx` | Integrar com hooks, scroll infinito |
| `src/components/modals/PostModal.tsx` | Upload real, salvar no banco |

---

## 8. Detalhes Tecnicos

### Query com dados do autor

```typescript
const { data } = await supabase
  .from("posts")
  .select(`
    *,
    profiles:user_id (
      id, name, username, avatar_url
    ),
    post_likes!inner (
      user_id
    )
  `)
  .order("created_at", { ascending: false })
  .range(from, to);
```

### Paginacao com useInfiniteQuery

```typescript
const PAGE_SIZE = 10;

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ["posts"],
  queryFn: async ({ pageParam = 0 }) => {
    const from = pageParam * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles:user_id(*)")
      .order("created_at", { ascending: false })
      .range(from, to);
    
    return data;
  },
  getNextPageParam: (lastPage, pages) => {
    return lastPage.length === PAGE_SIZE ? pages.length : undefined;
  },
  initialPageParam: 0,
});
```

### Upload de imagem de post

```typescript
const uploadPostImage = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("post-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
};
```

### Toggle de curtida

```typescript
const toggleLike = async (postId: string) => {
  const { data: existing } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    // Remover curtida
    await supabase
      .from("post_likes")
      .delete()
      .eq("id", existing.id);
  } else {
    // Adicionar curtida
    await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: user.id });
  }
};
```

---

## 9. Scroll Infinito no Feed

Usar Intersection Observer para detectar quando usuario chega ao fim:

```typescript
const loadMoreRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 0.1 }
  );

  if (loadMoreRef.current) {
    observer.observe(loadMoreRef.current);
  }

  return () => observer.disconnect();
}, [hasNextPage, fetchNextPage]);

// No JSX
<div ref={loadMoreRef} className="h-10" />
```

---

## 10. Ordem de Implementacao

1. **Migracao SQL**: Criar tabelas posts, post_likes, post_comments
2. **Migracao Storage**: Criar bucket post-images
3. **Hook usePosts**: Carregar e criar posts
4. **ImageUpload.tsx**: Componente de upload
5. **PostModal.tsx**: Refatorar para salvar no banco
6. **PostCard.tsx**: Extrair componente de post
7. **Comunidade.tsx**: Integrar com hooks, paginacao
8. **Hook useComments**: CRUD de comentarios
9. **CommentsModal.tsx**: Interface de comentarios
10. **Testes end-to-end**: Fluxo completo

---

## Resultado Esperado

Apos implementacao:

1. Posts persistem no banco de dados
2. Upload de imagens funciona e salva no storage
3. Curtidas sao registradas e exibidas em tempo real
4. Comentarios podem ser adicionados a qualquer post
5. Feed carrega mais posts conforme usuario rola
6. Usuario ve seu avatar e nome ao criar post
7. Usuario pode deletar seus proprios posts
