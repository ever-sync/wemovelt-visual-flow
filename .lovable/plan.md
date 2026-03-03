

## Problema

O formulário de equipamento é muito longo para caber em um modal, causando problemas de responsividade. Os selects também podem estar com comportamento instável por conflitos com o scroll do Dialog.

## Solução: Formulário em Etapas (Stepper)

Dividir o `EquipmentForm` em **3 etapas** com navegação "Próximo / Voltar", mantendo tudo no mesmo Dialog mas exibindo apenas uma seção por vez. Isso resolve tanto o problema de tamanho quanto os conflitos de Select dentro de modal com scroll.

### Etapas

1. **Informações Básicas** — Nome, Descrição, URL da Imagem, Link do Vídeo
2. **Classificação** — Categoria (Select), Dificuldade (Select), Academia (Select), Músculos Trabalhados (checkboxes)
3. **Especificações** — Lista dinâmica de especificações técnicas

### Implementação

**Arquivo**: `src/components/admin/EquipmentForm.tsx`

- Adicionar estado `step` (1, 2 ou 3)
- Renderizar conteúdo condicional baseado no step
- Indicador visual de progresso no topo (3 bolinhas/badges com labels)
- Botões "Voltar" e "Próximo" em cada etapa; "Criar/Salvar" apenas na etapa final
- Reset do step para 1 quando o modal abre/fecha
- Remover `overflow-y-auto` do DialogContent (cada etapa cabe sem scroll)
- Manter toda a lógica de formData e submit inalterada

### Navegação

```text
[1. Básico] → [2. Classificação] → [3. Especificações]
   [Cancelar] [Próximo →]    [← Voltar] [Próximo →]    [← Voltar] [Salvar]
```

### Arquivos alterados
- `src/components/admin/EquipmentForm.tsx` — refatorar para stepper multi-etapa

