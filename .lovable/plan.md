

## Problema

Atualmente o campo de imagem do equipamento aceita apenas uma URL digitada manualmente. O usuário quer poder **fazer upload de uma imagem** diretamente, que será armazenada no backend e a URL salva automaticamente no banco.

## Solução

### 1. Criar bucket de storage `equipment-images`

Migration SQL para criar o bucket público e políticas RLS permitindo admins fazerem upload/delete:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('equipment-images', 'equipment-images', true);

CREATE POLICY "Anyone can view equipment images"
ON storage.objects FOR SELECT USING (bucket_id = 'equipment-images');

CREATE POLICY "Admins can upload equipment images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'equipment-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete equipment images"
ON storage.objects FOR DELETE
USING (bucket_id = 'equipment-images' AND public.has_role(auth.uid(), 'admin'));
```

### 2. Atualizar EquipmentForm (Etapa 1)

Substituir o campo "URL da Imagem" (input de texto) pelo componente `ImageUpload` já existente no projeto. No submit:

1. Se o usuário selecionou um arquivo, fazer upload para `equipment-images/{timestamp}-{filename}`
2. Obter a URL pública e salvar no campo `image_url`
3. Se está editando e já tinha imagem anterior, deletar o arquivo antigo do storage

### 3. Arquivos alterados

- `src/components/admin/EquipmentForm.tsx` — trocar input URL por ImageUpload, adicionar lógica de upload no submit
- Nova migration para o bucket `equipment-images`

