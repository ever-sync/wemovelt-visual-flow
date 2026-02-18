import { MapPin, Loader2, Navigation, LocateFixed } from "lucide-react";
import { useState, useEffect } from "react";
import { useGyms } from "@/hooks/useGyms";
import LeafletMapDisplay from "./LeafletMapDisplay";
import { Button } from "./ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";

const GymLocationsSection = () => {
  const { gyms, isLoading, getGymsWithDistance } = useGyms();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const { status: geoStatus, position: userPosition, requestLocation } = useGeolocation();

  const gymsWithDistance = userPosition
    ? getGymsWithDistance(userPosition)
    : gyms.map(g => ({ ...g, distance: null as number | null }));

  const nearestGymId = gymsWithDistance[0]?.id ?? null;

  useEffect(() => {
    if (userPosition && nearestGymId) {
      setSelectedLocation(nearestGymId);
    }
  }, [userPosition, nearestGymId]);
  
  const selectedGym = selectedLocation ? gyms.find(g => g.id === selectedLocation) : null;

  const openGoogleMaps = (address: string) => {
    const destination = encodeURIComponent(address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(url, '_blank');
  };

  const openWaze = (address: string) => {
    const destination = encodeURIComponent(address);
    const url = `https://www.waze.com/ul?q=${destination}&navigate=yes`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="text-primary">●</span> LOCALIZAÇÕES DAS ACADEMIAS
        </h2>
        <div className="bg-card rounded-2xl p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (gyms.length === 0) {
    return (
      <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <span className="text-primary">●</span> LOCALIZAÇÕES DAS ACADEMIAS
        </h2>
        <div className="bg-card rounded-2xl p-6 text-center">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma academia cadastrada ainda.</p>
        </div>
      </section>
    );
  }

  // Simulated map fallback component
  const SimulatedMapFallback = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20">
      <svg className="w-full h-full opacity-30" viewBox="0 0 400 200">
        {/* Grid lines */}
        {[...Array(10)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={i * 20}
            x2="400"
            y2={i * 20}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground"
          />
        ))}
        {[...Array(20)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 20}
            y1="0"
            x2={i * 20}
            y2="200"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-muted-foreground"
          />
        ))}
        {/* Roads */}
        <path
          d="M0 100 Q 100 80, 200 100 T 400 90"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted-foreground/50"
        />
        <path
          d="M200 0 Q 180 100, 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-muted-foreground/40"
        />
      </svg>

      {/* Map pins - dynamically positioned based on number of gyms */}
      {gyms.slice(0, 4).map((gym, index) => {
        const positions = [
          { top: "33%", left: "25%" },
          { top: "50%", right: "25%" },
          { top: "25%", right: "40%" },
          { top: "60%", left: "40%" },
        ];
        const pos = positions[index % positions.length];
        
        return (
          <div
            key={gym.id}
            className={`absolute cursor-pointer transition-transform ${
              selectedLocation === gym.id ? "scale-125" : "hover:scale-110"
            }`}
            style={pos}
            onClick={() => setSelectedLocation(gym.id)}
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                selectedLocation === gym.id ? "wemovelt-gradient" : "bg-primary"
              }`}>
                <MapPin size={18} className="text-foreground" />
              </div>
              {selectedLocation === gym.id && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-ping" />
              )}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-xs">
        {gyms.length} {gyms.length === 1 ? "academia" : "academias"}
      </div>
    </div>
  );

  return (
    <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span className="text-primary">●</span> LOCALIZAÇÕES DAS ACADEMIAS
      </h2>

      <div className="bg-card rounded-2xl overflow-hidden">
        {/* Map section */}
        <div className="relative h-48 bg-secondary overflow-hidden">
          <LeafletMapDisplay
            gyms={gyms}
            selectedId={selectedLocation}
            onMarkerClick={setSelectedLocation}
            userPosition={userPosition}
          />
          {/* My Location button */}
          <button
            onClick={requestLocation}
            disabled={geoStatus === 'requesting'}
            className="absolute top-2 right-2 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-md hover:bg-card transition-colors disabled:opacity-60"
            title="Minha localização"
          >
            {geoStatus === 'requesting' ? (
              <Loader2 size={18} className="text-primary animate-spin" />
            ) : (
              <LocateFixed size={18} className={geoStatus === 'success' ? 'text-primary' : 'text-muted-foreground'} />
            )}
          </button>
        </div>

        {/* Location cards */}
        <div className="p-4 space-y-2">
          {gymsWithDistance.map((gym, index) => {
            const isNearest = userPosition && index === 0;
            const isSelected = selectedLocation === gym.id;
            const distanceText = gym.distance !== null
              ? gym.distance >= 1000
                ? `${(gym.distance / 1000).toFixed(1)} km`
                : `${gym.distance} m`
              : null;

            return (
              <button
                key={gym.id}
                onClick={() => setSelectedLocation(gym.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isSelected
                    ? "bg-primary/20 border border-primary"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "wemovelt-gradient" : "bg-primary/20"
                }`}>
                  <MapPin size={18} className={isSelected ? "text-foreground" : "text-primary"} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate">{gym.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{gym.address || "Endereço não informado"}</p>
                  {isNearest && (
                    <span className="text-xs font-semibold text-primary">🏆 Mais próxima</span>
                  )}
                </div>
                {distanceText && (
                  <span className={`text-xs font-bold flex-shrink-0 ${isNearest ? "text-primary" : "text-muted-foreground"}`}>
                    {distanceText}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* GPS Navigation buttons */}
        {selectedGym && selectedGym.address && (
          <div className="p-4 border-t border-border flex gap-2">
            <Button 
              onClick={() => openGoogleMaps(selectedGym.address!)}
              className="flex-1 wemovelt-gradient"
            >
              <Navigation size={18} />
              Google Maps
            </Button>
            <Button 
              onClick={() => openWaze(selectedGym.address!)}
              variant="secondary"
              className="flex-1"
            >
              <Navigation size={18} />
              Waze
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default GymLocationsSection;
