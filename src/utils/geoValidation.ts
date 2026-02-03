export interface GeoPosition {
  lat: number;
  lng: number;
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
