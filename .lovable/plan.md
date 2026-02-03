
# Plano: Aumentar Zona de Respiro do Header

## Situacao Atual

O header tem altura fixa de **56px** (h-14) e o conteudo usa **64px** de padding-top (pt-16), deixando apenas **8px** de respiro entre o header e o primeiro elemento.

```
+---------------------------+
|         HEADER (56px)     |
+---------------------------+
|  8px de espaco            |
|  [Primeiro Card]          |
```

## Proposta

Aumentar o padding-top do main de **pt-16** (64px) para **pt-20** (80px), criando **24px** de respiro. Isso proporciona uma zona de respiro mais confortavel sem alterar o design do header.

```
+---------------------------+
|         HEADER (56px)     |
+---------------------------+
|                           |
|  24px de espaco           |
|                           |
|  [Primeiro Card]          |
```

## Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Home.tsx` | `pt-16` → `pt-20` |
| `src/pages/Treinos.tsx` | `pt-16` → `pt-20` |
| `src/pages/Habitos.tsx` | `pt-16` → `pt-20` |
| `src/pages/Frequencia.tsx` | `pt-16` → `pt-20` |
| `src/pages/Comunidade.tsx` | `pt-14` → `pt-20` |

## Secao Tecnica

### Mudanca em Cada Pagina

Linha do main em cada arquivo:

```tsx
// Antes
<main className="pt-16 px-4 max-w-md mx-auto space-y-6">

// Depois
<main className="pt-20 px-4 max-w-md mx-auto space-y-6">
```

Para Comunidade (que usa pt-14):
```tsx
// Antes
<main className="pt-14 max-w-md mx-auto">

// Depois
<main className="pt-20 max-w-md mx-auto">
```

### Valores de Referencia

| Classe | Pixels |
|--------|--------|
| pt-14 | 56px |
| pt-16 | 64px |
| pt-20 | 80px |
| pt-24 | 96px |

Com **pt-20** teremos 24px de espaco visual (80px - 56px do header), o que e mais confortavel para leitura e navegacao.
