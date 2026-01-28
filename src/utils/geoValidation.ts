import { GYMS, type Gym } from "@/data/gyms";

export interface GeoPosition {
  lat: number;
  lng: number;
}

export interface GeoValidationResult {
  valid: boolean;
  gym?: Gym;
  distance?: number;
  error?: string;
}

/**
 * Calculates the distance between two coordinates using the Haversine formula
 * @returns Distance in meters
 */
export const calculateDistance = (
  pos1: GeoPosition,
  pos2: GeoPosition
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLng = toRad(pos2.lng - pos1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(pos1.lat)) *
      Math.cos(toRad(pos2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Finds the nearest gym to the given position and validates if within radius
 */
export const validateGeoLocation = (
  position: GeoPosition
): GeoValidationResult => {
  let nearestGym: Gym | undefined;
  let nearestDistance = Infinity;

  for (const gym of GYMS) {
    const distance = calculateDistance(position, { lat: gym.lat, lng: gym.lng });
    
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestGym = gym;
    }
  }

  if (!nearestGym) {
    return {
      valid: false,
      error: "Nenhuma academia encontrada",
    };
  }

  if (nearestDistance <= nearestGym.radius) {
    return {
      valid: true,
      gym: nearestGym,
      distance: Math.round(nearestDistance),
    };
  }

  return {
    valid: false,
    gym: nearestGym,
    distance: Math.round(nearestDistance),
    error: `Você está a ${Math.round(nearestDistance)}m da academia mais próxima`,
  };
};

/**
 * Gets all gyms sorted by distance from position
 */
export const getGymsByDistance = (position: GeoPosition): Array<Gym & { distance: number }> => {
  return GYMS.map((gym) => ({
    ...gym,
    distance: Math.round(calculateDistance(position, { lat: gym.lat, lng: gym.lng })),
  })).sort((a, b) => a.distance - b.distance);
};
