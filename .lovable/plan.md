

# Plano: Tornar Campo Numero Opcional

## Resumo

Ajustar o formulario de academia para que o campo "Numero" seja opcional, ja que alguns locais (pracas, parques) podem nao ter numero.

---

## Mudancas Necessarias

### 1. Atualizar Schema de Validacao

**Arquivo:** `src/lib/validations.ts`

Alterar o campo `number` de obrigatorio para opcional:

```typescript
// Antes
number: z.string().min(1, "Número obrigatório"),

// Depois
number: z.string().optional(),
```

### 2. Atualizar Label do Campo no Formulario

**Arquivo:** `src/components/admin/GymForm.tsx`

Remover o asterisco (*) do label do campo Numero:

```typescript
// Antes
<Label htmlFor="number">Número *</Label>

// Depois
<Label htmlFor="number">Número</Label>
```

### 3. Ajustar Montagem do Endereco

**Arquivo:** `src/components/admin/GymForm.tsx`

Montar o endereco de forma inteligente, incluindo o numero apenas se existir:

```typescript
// Antes
const fullAddress = `${formData.street}, ${formData.number} - ${formData.neighborhood}, ${formData.city} - ${formData.state}, ${formData.cep}`;

// Depois
const streetPart = formData.number 
  ? `${formData.street}, ${formData.number}` 
  : formData.street;
const fullAddress = `${streetPart} - ${formData.neighborhood}, ${formData.city} - ${formData.state}, ${formData.cep}`;
```

---

## Exemplos de Endereco Gerado

| Com Numero | Sem Numero |
|------------|------------|
| `Rua das Flores, 123 - Centro, São Paulo - SP, 01310-100` | `Praça da Liberdade - Funcionários, Belo Horizonte - MG, 30130-000` |

---

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/lib/validations.ts` | Tornar campo `number` opcional no schema |
| `src/components/admin/GymForm.tsx` | Remover asterisco do label e ajustar montagem do endereco |

---

## Sobre os Links de Navegacao

Os links de navegacao Google Maps e Waze **ja estao funcionando corretamente** com o endereco:

- Google Maps: `https://www.google.com/maps/dir/?api=1&destination={endereco_codificado}`
- Waze: `https://www.waze.com/ul?q={endereco_codificado}&navigate=yes`

O `encodeURIComponent()` ja esta sendo aplicado ao endereco, garantindo compatibilidade com caracteres especiais e espacos.

