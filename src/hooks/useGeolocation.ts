import { useState, useCallback } from "react";
import { type GeoPosition } from "@/utils/geoValidation";

export type GeoStatus = "idle" | "requesting" | "success" | "error";

export interface UseGeolocationReturn {
  status: GeoStatus;
  position: GeoPosition | null;
  error: string | null;
  requestLocation: () => void;
  reset: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setPosition(null);
    setError(null);
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setError("Geolocalização não suportada neste dispositivo");
      return;
    }

    setStatus("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const geoPos: GeoPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(geoPos);
        setStatus("success");
      },
      (err) => {
        setStatus("error");
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Permissão de localização negada. Habilite nas configurações do navegador.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Localização indisponível. Verifique se o GPS está ativo.");
            break;
          case err.TIMEOUT:
            setError("Tempo esgotado ao obter localização. Tente novamente.");
            break;
          default:
            setError("Erro ao obter localização. Tente novamente.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    status,
    position,
    error,
    requestLocation,
    reset,
  };
};
