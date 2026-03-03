import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance, type GeoPosition } from "@/utils/geoValidation";
import { useAuth } from "@/contexts/AuthContext";

export interface Gym {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  radius: number | null;
  image_url: string | null;
  equipment_count: number | null;
}

export interface NearestGymResult {
  gym: Gym;
  distance: number;
  isWithinRadius: boolean;
}

export const useGyms = () => {
  const { user } = useAuth();

  const { data: gyms = [], isLoading, error } = useQuery({
    queryKey: ["gyms", user?.id ?? "anon"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gyms")
        .select("id, name, address, lat, lng, radius, image_url, equipment_count")
        .order("name");

      if (error) throw error;
      return data as Gym[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: 3,
  });

  const getGymById = (id: string): Gym | undefined => {
    return gyms.find((gym) => gym.id === id);
  };

  const getNearestGym = (position: GeoPosition): NearestGymResult | null => {
    if (gyms.length === 0) return null;

    let nearestGym: Gym | null = null;
    let nearestDistance = Infinity;

    for (const gym of gyms) {
      if (gym.lat === null || gym.lng === null) continue;
      const distance = calculateDistance(position, { lat: gym.lat, lng: gym.lng });
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestGym = gym;
      }
    }

    if (!nearestGym) return null;

    return {
      gym: nearestGym,
      distance: Math.round(nearestDistance),
      isWithinRadius: nearestDistance <= (nearestGym.radius ?? 50),
    };
  };

  const getGymsWithDistance = (position: GeoPosition): Array<Gym & { distance: number }> => {
    return gyms
      .filter((gym) => gym.lat !== null && gym.lng !== null)
      .map((gym) => ({
        ...gym,
        distance: Math.round(calculateDistance(position, { lat: gym.lat!, lng: gym.lng! })),
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  return {
    gyms,
    isLoading,
    error,
    getGymById,
    getNearestGym,
    getGymsWithDistance,
  };
};
