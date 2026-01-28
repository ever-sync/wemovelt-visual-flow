import { useState, useCallback, useEffect } from "react";
import { validateGeoLocation, type GeoPosition } from "@/utils/geoValidation";
import type { Gym } from "@/data/gyms";

export type GeoStatus = "idle" | "requesting" | "success" | "error";

export interface UseGeolocationReturn {
  status: GeoStatus;
  position: GeoPosition | null;
  error: string | null;
  nearestGym: Gym | null;
  distance: number | null;
  isWithinRadius: boolean;
  requestLocation: () => void;
  reset: () => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nearestGym, setNearestGym] = useState<Gym | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);

  const reset = useCallback(() => {
    setStatus("idle");
    setPosition(null);
    setError(null);
    setNearestGym(null);
    setDistance(null);
    setIsWithinRadius(false);
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

        // Validate against gyms
        const result = validateGeoLocation(geoPos);
        
        if (result.gym) {
          setNearestGym(result.gym);
          setDistance(result.distance ?? null);
        }

        if (result.valid) {
          setIsWithinRadius(true);
          setStatus("success");
        } else {
          setIsWithinRadius(false);
          setStatus("error");
          setError(result.error ?? "Você não está próximo de uma academia");
        }
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
    nearestGym,
    distance,
    isWithinRadius,
    requestLocation,
    reset,
  };
};
