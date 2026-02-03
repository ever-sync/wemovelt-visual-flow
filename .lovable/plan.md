
# Plano: Marcadores Personalizados + Navegação GPS

## Resumo

Duas melhorias na seção de academias:
1. Marcadores customizados no mapa com o visual da marca WEMOVELT (gradiente laranja-vermelho + ícone)
2. Botões para abrir navegação GPS externa (Google Maps ou Waze) quando uma academia é selecionada

---

## Mudança 1: Marcador Personalizado WEMOVELT

**Arquivo:** `src/components/GoogleMapsDisplay.tsx`

Substituir o Pin padrão por um marcador HTML customizado com o visual da marca:

```typescript
// Marcador com gradiente WEMOVELT + ícone de localização
<AdvancedMarker key={gym.id} position={{ lat: gym.lat, lng: gym.lng }}>
  <div className={`
    w-10 h-10 rounded-full flex items-center justify-center 
    shadow-lg cursor-pointer transition-transform
    ${isSelected ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}
  `}
    style={{
      background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)'
    }}
  >
    <MapPin className="w-5 h-5 text-white" />
  </div>
</AdvancedMarker>
```

Visual do marcador:
- Círculo com gradiente laranja para vermelho (cores WEMOVELT)
- Ícone MapPin branco no centro
- Escala maior quando selecionado (1.25x)
- Borda branca no estado selecionado
- Sombra para destacar do mapa

---

## Mudança 2: Botões de Navegação GPS

**Arquivo:** `src/components/GymLocationsSection.tsx`

Quando uma academia é selecionada, exibir botões para abrir navegação externa:

```typescript
// Seção de navegação que aparece quando academia é selecionada
{selectedGym && selectedGym.lat && selectedGym.lng && (
  <div className="p-4 border-t border-border flex gap-2">
    <Button 
      onClick={() => openGoogleMaps(selectedGym.lat, selectedGym.lng)}
      className="flex-1 wemovelt-gradient"
    >
      <Navigation size={18} />
      Google Maps
    </Button>
    <Button 
      onClick={() => openWaze(selectedGym.lat, selectedGym.lng)}
      variant="secondary"
      className="flex-1"
    >
      <Navigation size={18} />
      Waze
    </Button>
  </div>
)}
```

Funções para abrir navegação:

```typescript
// Abre Google Maps com destino
const openGoogleMaps = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
};

// Abre Waze com destino
const openWaze = (lat: number, lng: number) => {
  const url = `https://www.waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  window.open(url, '_blank');
};
```

---

## Visual Esperado

| Estado | Visual |
|--------|--------|
| Academia não selecionada | Marcador normal (40x40px) |
| Academia selecionada | Marcador maior (50x50px) + borda branca + botões GPS visíveis |
| Clique em "Google Maps" | Abre app Google Maps com rota para academia |
| Clique em "Waze" | Abre app Waze com navegação para academia |

---

## Detalhes Técnicos

### URLs de Navegação

| App | URL Format |
|-----|------------|
| Google Maps | `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` |
| Waze | `https://www.waze.com/ul?ll={lat},{lng}&navigate=yes` |

### Comportamento Mobile
- Em dispositivos móveis, os links abrem automaticamente os apps instalados
- Se não tiver o app, abre no navegador

---

## Arquivos a Modificar

| Arquivo | Mudanças |
|---------|----------|
| `src/components/GoogleMapsDisplay.tsx` | Substituir Pin por marcador HTML customizado |
| `src/components/GymLocationsSection.tsx` | Adicionar botões de navegação GPS |
