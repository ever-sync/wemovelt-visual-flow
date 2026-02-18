
## Tooltip/Popup no marcador da academia

### Objetivo

Ao clicar em um marcador no mapa, exibir um popup nativo do Leaflet com as informações da academia: **nome**, **endereço** e **raio de check-in**.

---

### Arquivo a modificar

**`src/components/LeafletMapDisplay.tsx`** — único arquivo afetado.

---

### Mudanças necessárias

#### 1. Adicionar `address` à interface `Gym`

O componente ainda não recebe o endereço. Precisamos adicionar o campo:

```typescript
interface Gym {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  radius: number | null;
  address: string | null; // NOVO
}
```

`GymLocationsSection` já passa o array completo de `gyms` (que inclui `address`) — nenhuma mudança necessária lá.

#### 2. Injetar estilo CSS customizado do popup no mapa

O Leaflet tem um popup padrão com borda branca. Vamos customizar para combinar com o tema escuro da aplicação, injetando CSS uma única vez durante a inicialização do mapa:

```typescript
// No useEffect de inicialização do mapa
const style = document.createElement('style');
style.textContent = `
  .gym-popup .leaflet-popup-content-wrapper {
    background: #1c1c1e;
    color: #f5f5f5;
    border: 1px solid rgba(249,115,22,0.4);
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.6);
    padding: 0;
  }
  .gym-popup .leaflet-popup-tip {
    background: #1c1c1e;
  }
  .gym-popup .leaflet-popup-content {
    margin: 0;
  }
`;
document.head.appendChild(style);
```

#### 3. Criar o popup com `L.popup` e vincular ao marcador

Em vez de usar o evento `click` apenas para `onMarkerClick`, o popup será criado com `L.popup` e vinculado ao marcador via `.bindPopup()`. O evento `click` continua chamando `onMarkerClick` normalmente.

```typescript
// Conteúdo HTML do popup
const radiusText = gym.radius
  ? gym.radius >= 1000
    ? `${(gym.radius / 1000).toFixed(1)} km`
    : `${gym.radius} m`
  : 'Não definido';

const popupContent = `
  <div style="padding:12px 14px;min-width:180px">
    <p style="font-weight:700;font-size:14px;margin:0 0 4px">${gym.name}</p>
    <p style="font-size:12px;color:#a3a3a3;margin:0 0 8px">${gym.address || 'Endereço não informado'}</p>
    <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#f97316;font-weight:600">
      <span>📍</span>
      <span>Raio de check-in: ${radiusText}</span>
    </div>
  </div>
`;

const marker = L.marker([gym.lat!, gym.lng!], {
  icon: createMarkerIcon(isSelected),
  title: gym.name,
})
  .bindPopup(popupContent, {
    className: 'gym-popup',
    closeButton: false,
    offset: [0, -16],
  })
  .on('click', () => onMarkerClick(gym.id))
  .addTo(map);
```

#### 4. Abrir popup automaticamente quando a academia é selecionada

Ao selecionar via lista (não só pelo marcador), o popup deve abrir automaticamente:

```typescript
// No useEffect de marcadores, após criar todos:
if (isSelected) {
  // Abrir popup com pequeno delay para garantir que o mapa renderizou
  setTimeout(() => marker.openPopup(), 50);
}
```

---

### Comportamento final

| Ação | Resultado |
|---|---|
| Clicar no marcador | Seleciona academia na lista + abre popup |
| Clicar na lista | Seleciona academia no mapa + abre popup automaticamente |
| Clicar fora | Fecha popup normalmente (comportamento padrão Leaflet) |

---

### Nenhuma outra mudança necessária

- `GymLocationsSection.tsx` — já passa `address` no array de gyms
- Banco de dados — sem alterações
- Outros componentes — sem alterações
