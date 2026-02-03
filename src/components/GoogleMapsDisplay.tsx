import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';
import { MapPin } from 'lucide-react';

interface Gym {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
}

interface GoogleMapsDisplayProps {
  gyms: Gym[];
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
}

const GoogleMapsDisplay = ({ gyms, selectedId, onMarkerClick }: GoogleMapsDisplayProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Calculate center based on gyms with valid coordinates
  const center = useMemo(() => {
    const validGyms = gyms.filter(g => g.lat !== null && g.lng !== null);
    if (validGyms.length === 0) {
      return { lat: -23.55052, lng: -46.633308 }; // São Paulo default
    }

    const avgLat = validGyms.reduce((sum, g) => sum + g.lat!, 0) / validGyms.length;
    const avgLng = validGyms.reduce((sum, g) => sum + g.lng!, 0) / validGyms.length;
    return { lat: avgLat, lng: avgLng };
  }, [gyms]);

  // Calculate appropriate zoom level based on gym spread
  const zoom = useMemo(() => {
    const validGyms = gyms.filter(g => g.lat !== null && g.lng !== null);
    if (validGyms.length <= 1) return 14;
    
    // Calculate the spread of coordinates
    const lats = validGyms.map(g => g.lat!);
    const lngs = validGyms.map(g => g.lng!);
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);
    
    // Adjust zoom based on spread
    if (maxSpread > 0.1) return 11;
    if (maxSpread > 0.05) return 12;
    if (maxSpread > 0.02) return 13;
    return 14;
  }, [gyms]);

  if (!apiKey) {
    return null;
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        style={{ width: '100%', height: '100%' }}
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling="cooperative"
        disableDefaultUI={true}
        mapId="gym-locations-map"
        colorScheme="DARK"
      >
        {gyms.map(gym => {
          if (gym.lat === null || gym.lng === null) return null;
          
          const isSelected = selectedId === gym.id;
          
          return (
            <AdvancedMarker
              key={gym.id}
              position={{ lat: gym.lat, lng: gym.lng }}
              onClick={() => onMarkerClick(gym.id)}
              title={gym.name}
            >
              <div 
                className={`
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
          );
        })}
      </Map>
    </APIProvider>
  );
};

export default GoogleMapsDisplay;
