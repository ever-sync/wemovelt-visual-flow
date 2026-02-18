
## Mostrar raio de check-in no mapa

### Objetivo

Desenhar um círculo semi-transparente ao redor de cada marcador de academia no mapa Leaflet, representando o raio de check-in configurado (campo `radius` em metros). Isso permite que o usuário visualize claramente a área em que o check-in é válido.

---

### O que será alterado

**Arquivo único:** `src/components/LeafletMapDisplay.tsx`

#### 1. Atualizar a interface `Gym`

O componente atualmente recebe apenas `id`, `name`, `lat` e `lng`. Precisamos adicionar `radius`:

```typescript
interface Gym {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  radius: number | null; // novo campo
}
```

#### 2. Adicionar ref para os círculos de raio

Um `Map` de refs separado para armazenar os círculos das academias (assim como já existe `markersRef` para os marcadores):

```typescript
const gymCirclesRef = useRef<Map<string, L.Circle>>(new Map());
```

#### 3. Criar círculo de raio junto com cada marcador

No `useEffect` de "Update gym markers", após criar cada marcador, adicionar um `L.circle` com o raio da academia:

```typescript
// Círculo de raio de check-in
if (gym.radius && gym.radius > 0) {
  const isSelected = selectedId === gym.id;
  const circle = L.circle([gym.lat!, gym.lng!], {
    radius: gym.radius,            // raio em metros (ex: 50m)
    color: isSelected ? '#f97316' : '#f9731680',
    fillColor: isSelected ? '#f97316' : '#f97316',
    fillOpacity: isSelected ? 0.15 : 0.08,
    weight: isSelected ? 2 : 1,
    dashArray: isSelected ? undefined : '4 4',
  }).addTo(map);

  gymCirclesRef.current.set(gym.id, circle);
}
```

#### 4. Limpar círculos junto com os marcadores

No início do useEffect, antes de recriar os marcadores:

```typescript
gymCirclesRef.current.forEach(c => c.remove());
gymCirclesRef.current.clear();
```

---

### Comportamento visual

| Estado da academia | Cor da borda | Preenchimento | Borda |
|---|---|---|---|
| Normal | Laranja translúcido | Laranja 8% opacidade | Pontilhada, 1px |
| Selecionada | Laranja sólido | Laranja 15% opacidade | Sólida, 2px |

O círculo muda de visual junto com o marcador quando a academia é selecionada (clique no marcador ou na lista).

---

### Dados já disponíveis

O hook `useGyms` já retorna o campo `radius` de cada academia. O componente `GymLocationsSection` já passa o array `gyms` completo para `LeafletMapDisplay`, que inclui o `radius`. Só precisamos adicionar o campo na interface local do componente e usar o valor ao criar o círculo.

---

### Resumo técnico

| Item | Detalhe |
|---|---|
| Arquivo modificado | `src/components/LeafletMapDisplay.tsx` |
| Mudanças no banco | Nenhuma — campo `radius` já existe na tabela `gyms` |
| Mudanças em outros componentes | Nenhuma |
| Dependências novas | Nenhuma |
