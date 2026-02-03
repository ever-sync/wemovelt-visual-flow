import { MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { useGyms } from "@/hooks/useGyms";

const GymLocationsSection = () => {
  const { gyms, isLoading } = useGyms();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

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

  return (
    <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <span className="text-primary">●</span> LOCALIZAÇÕES DAS ACADEMIAS
      </h2>

      <div className="bg-card rounded-2xl overflow-hidden">
        {/* Map placeholder - interactive visual */}
        <div className="relative h-48 bg-secondary overflow-hidden">
          {/* Simulated map background */}
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
          </div>

          {/* Map pins - dynamically positioned based on number of gyms */}
          {gyms.slice(0, 4).map((gym, index) => {
            // Position pins in different areas of the map
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

        {/* Location cards */}
        <div className="p-4 space-y-2">
          {gyms.map((gym) => (
            <button
              key={gym.id}
              onClick={() => setSelectedLocation(gym.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedLocation === gym.id
                  ? "bg-primary/20 border border-primary"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedLocation === gym.id ? "wemovelt-gradient" : "bg-primary/20"
              }`}>
                <MapPin size={18} className={selectedLocation === gym.id ? "text-foreground" : "text-primary"} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm">{gym.name}</h4>
                <p className="text-xs text-muted-foreground">{gym.address || "Endereço não informado"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GymLocationsSection;
