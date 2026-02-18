
## Implementação: Círculos de Raio de Check-in no Mapa

### Arquivo a modificar
`src/components/LeafletMapDisplay.tsx`

---

### Mudanças necessárias

**1. Interface `Gym` — adicionar campo `radius`**

```typescript
interface Gym {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  radius: number | null; // NOVO
}
```

**2. Novo ref para os círculos das academias**

Linha 62 — junto com os refs existentes, adicionar:
```typescript
const gymCirclesRef = useRef<Map<string, L.Circle>>(new Map());
```

**3. No `useEffect` de atualização de marcadores (linhas 98–125)**

- Antes de recriar os marcadores, limpar os círculos existentes:
```typescript
gymCirclesRef.current.forEach(c => c.remove());
gymCirclesRef.current.clear();
```

- Após criar cada marcador, desenhar o círculo de raio:
```typescript
if (gym.radius && gym.radius > 0) {
  const circle = L.circle([gym.lat!, gym.lng!], {
    radius: gym.radius,
    color: '#f97316',
    fillColor: '#f97316',
    fillOpacity: isSelected ? 0.15 : 0.08,
    weight: isSelected ? 2 : 1,
    dashArray: isSelected ? undefined : '4 4',
  }).addTo(map);
  gymCirclesRef.current.set(gym.id, circle);
}
```

---

### Comportamento visual

| Estado | Borda | Preenchimento | Estilo |
|---|---|---|---|
| Normal | Laranja, 1px | 8% opacidade | Pontilhada |
| Selecionada | Laranja, 2px | 15% opacidade | Sólida |

O círculo atualiza junto com o marcador toda vez que a academia é selecionada ou deseleccionada.

---

### Nenhuma outra mudança necessária

- O campo `radius` já existe na tabela `gyms` no banco
- O hook `useGyms` já busca e retorna `radius`
- `GymLocationsSection` já passa o array completo de `gyms` para o componente — o `radius` já chega, só faltava a interface local e a lógica de renderização
