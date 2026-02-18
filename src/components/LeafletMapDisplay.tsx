import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Gym {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  radius: number | null;
  address: string | null;
}

interface LeafletMapDisplayProps {
  gyms: Gym[];
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
  userPosition?: { lat: number; lng: number } | null;
}

const createMarkerIcon = (isSelected: boolean) => {
  const size = isSelected ? 40 : 32;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad${isSelected ? 's' : 'n'}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f97316"/>
          <stop offset="100%" style="stop-color:#dc2626"/>
        </linearGradient>
      </defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="url(#grad${isSelected ? 's' : 'n'})" stroke="${isSelected ? 'white' : 'none'}" stroke-width="${isSelected ? 3 : 0}"/>
      <path d="M${size / 2} ${size * 0.25}C${size * 0.38} ${size * 0.25} ${size * 0.32} ${size * 0.33} ${size * 0.32} ${size * 0.4}C${size * 0.32} ${size * 0.52} ${size / 2} ${size * 0.68} ${size / 2} ${size * 0.68}C${size / 2} ${size * 0.68} ${size * 0.68} ${size * 0.52} ${size * 0.68} ${size * 0.4}C${size * 0.68} ${size * 0.33} ${size * 0.62} ${size * 0.25} ${size / 2} ${size * 0.25}Z" fill="white" opacity="0.9"/>
      <circle cx="${size / 2}" cy="${size * 0.38}" r="${size * 0.06}" fill="url(#grad${isSelected ? 's' : 'n'})"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const createUserIcon = () => {
  const size = 28;
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}" fill="#3b82f6" stroke="white" stroke-width="3" opacity="0.95"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.15}" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const LeafletMapDisplay = ({ gyms, selectedId, onMarkerClick, userPosition }: LeafletMapDisplayProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const gymCirclesRef = useRef<Map<string, L.Circle>>(new Map());

  const validGyms = useMemo(() => gyms.filter(g => g.lat !== null && g.lng !== null), [gyms]);

  const center = useMemo((): [number, number] => {
    if (validGyms.length === 0) return [-23.55052, -46.633308];
    const avgLat = validGyms.reduce((s, g) => s + g.lat!, 0) / validGyms.length;
    const avgLng = validGyms.reduce((s, g) => s + g.lng!, 0) / validGyms.length;
    return [avgLat, avgLng];
  }, [validGyms]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Inject custom popup styles once
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

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update gym markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers and circles
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();
    gymCirclesRef.current.forEach(c => c.remove());
    gymCirclesRef.current.clear();

    validGyms.forEach(gym => {
      const isSelected = selectedId === gym.id;

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

      markersRef.current.set(gym.id, marker);

      if (isSelected) {
        setTimeout(() => marker.openPopup(), 50);
      }

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
    });

    // Fit bounds
    if (validGyms.length > 1) {
      const bounds = L.latLngBounds(validGyms.map(g => [g.lat!, g.lng!] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (validGyms.length === 1) {
      map.setView([validGyms[0].lat!, validGyms[0].lng!], 14);
    }
  }, [validGyms, selectedId, onMarkerClick]);

  // Update user location marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing user marker/circle
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (userCircleRef.current) {
      userCircleRef.current.remove();
      userCircleRef.current = null;
    }

    if (!userPosition) return;

    const { lat, lng } = userPosition;

    // Accuracy circle
    userCircleRef.current = L.circle([lat, lng], {
      radius: 80,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      weight: 1,
    }).addTo(map);

    // User dot marker
    userMarkerRef.current = L.marker([lat, lng], {
      icon: createUserIcon(),
      title: 'Minha localização',
      zIndexOffset: 1000,
    }).addTo(map);

    // Pan to user location
    map.setView([lat, lng], 14);
  }, [userPosition]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default LeafletMapDisplay;
