

## Problema

Os componentes `Select` (Categoria, Dificuldade, Academia) na Etapa 3 do formulário não estão funcionando porque o `Dialog` do Radix UI com `modal={true}` (padrão) captura todos os eventos de ponteiro, impedindo que os dropdowns do `Select` (que usam Portal) abram corretamente.

## Solução

Adicionar a prop `modal={false}` no componente `<Dialog>` do `EquipmentForm.tsx`. Isso permite que os portais dos `Select` recebam eventos de clique normalmente enquanto o diálogo permanece aberto.

### Arquivo alterado
- `src/components/admin/EquipmentForm.tsx` — adicionar `modal={false}` ao `<Dialog>`

### Mudança

```tsx
// De:
<Dialog open={open} onOpenChange={onOpenChange}>

// Para:
<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
```

Apenas uma linha alterada. Isso resolve o conflito entre os portais do Select e o overlay modal do Dialog.

