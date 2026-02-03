
# Plano: Integração com Google Maps

## Resumo

Integrar o Google Maps real na seção de localizações das academias, substituindo o mapa simulado por um mapa interativo com marcadores dinâmicos mostrando a localização de cada academia.

---

## Requisitos

### API Key do Google Maps

Para usar o Google Maps, é necessária uma API Key do Google Cloud Platform com as seguintes APIs habilitadas:
- Maps JavaScript API
- Places API (opcional, para autocomplete de endereços)

---

## Biblioteca Escolhida

**`@vis.gl/react-google-maps`** - Biblioteca oficial mantida pelo Google/Vis.gl
- Moderna e bem tipada para TypeScript
- Suporte a React 18+
- API simples e declarativa

---

## Implementação

### 1. Adicionar Dependência

Instalar a biblioteca:
```bash
npm install @vis.gl/react-google-maps
```

### 2. Configurar API Key

Solicitar ao usuário a API Key do Google Maps para armazenar como variável de ambiente:
- Nome: `VITE_GOOGLE_MAPS_API_KEY`

### 3. Criar Componente de Mapa

**Novo arquivo:** `src/components/GoogleMapsDisplay.tsx`

```typescript
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

interface Gym {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
}

interface Props {
  gyms: Gym[];
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
}

const GoogleMapsDisplay = ({ gyms, selectedId, onMarkerClick }: Props) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Calcular centro baseado nas academias
  const center = useMemo(() => {
    const validGyms = gyms.filter(g => g.lat && g.lng);
    if (validGyms.length === 0) return { lat: -23.55, lng: -46.63 }; // SP
    
    const avgLat = validGyms.reduce((sum, g) => sum + g.lat!, 0) / validGyms.length;
    const avgLng = validGyms.reduce((sum, g) => sum + g.lng!, 0) / validGyms.length;
    return { lat: avgLat, lng: avgLng };
  }, [gyms]);

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: '100%', height: '200px' }}
        defaultCenter={center}
        defaultZoom={13}
        gestureHandling="cooperative"
        disableDefaultUI={true}
        mapId="gym-locations"
      >
        {gyms.map(gym => gym.lat && gym.lng && (
          <Marker
            key={gym.id}
            position={{ lat: gym.lat, lng: gym.lng }}
            onClick={() => onMarkerClick(gym.id)}
          />
        ))}
      </Map>
    </APIProvider>
  );
};
```

### 4. Atualizar GymLocationsSection

**Arquivo:** `src/components/GymLocationsSection.tsx`

Mudanças:
- Importar o novo componente `GoogleMapsDisplay`
- Substituir o mapa SVG simulado pelo Google Maps real
- Manter fallback para caso não tenha API key configurada
- Clicar no marcador seleciona a academia

```typescript
import GoogleMapsDisplay from "./GoogleMapsDisplay";

const GymLocationsSection = () => {
  const { gyms, isLoading } = useGyms();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  
  const hasGoogleMapsKey = !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <section>
      <div className="bg-card rounded-2xl overflow-hidden">
        {/* Mapa */}
        <div className="relative h-48 overflow-hidden">
          {hasGoogleMapsKey ? (
            <GoogleMapsDisplay
              gyms={gyms}
              selectedId={selectedLocation}
              onMarkerClick={setSelectedLocation}
            />
          ) : (
            // Fallback: mapa simulado atual
            <SimulatedMapFallback />
          )}
        </div>

        {/* Cards das academias */}
        <div className="p-4 space-y-2">
          {gyms.map((gym) => (
            // ... cards existentes
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## Funcionalidades do Mapa

| Funcionalidade | Descrição |
|----------------|-----------|
| Marcadores | Pin para cada academia com coordenadas |
| Seleção | Clicar no marcador seleciona a academia |
| Centro automático | Mapa centraliza baseado nas academias |
| Zoom | Ajusta automaticamente para mostrar todos os pins |
| Estilo escuro | Tema escuro compatível com o app |

---

## Estilo Escuro do Mapa

Configurar estilos personalizados para o mapa combinar com o tema escuro do app:

```typescript
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
  // ... mais estilos
];
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/GoogleMapsDisplay.tsx` | Criar |
| `src/components/GymLocationsSection.tsx` | Modificar |
| `package.json` | Adicionar dependência |

---

## Fluxo de Configuração

1. Usuário clica para configurar
2. Solicita API Key do Google Maps
3. Armazena como `VITE_GOOGLE_MAPS_API_KEY` 
4. Mapa real aparece automaticamente

---

## Resultado Esperado

- Mapa interativo real do Google Maps
- Marcadores nas localizações das academias
- Integração visual com tema escuro
- Clicar no marcador seleciona a academia correspondente
- Fallback gracioso se não houver API key
