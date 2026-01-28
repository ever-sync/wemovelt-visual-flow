export interface Gym {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radius: number; // meters
}

export interface Equipment {
  id: string;
  name: string;
  gymId: string;
}

export const GYMS: Gym[] = [
  {
    id: "zona-sul-01",
    name: "WEMOVELT Zona Sul",
    address: "Av. Santo Amaro, 1234 - São Paulo",
    lat: -23.6245,
    lng: -46.6634,
    radius: 50,
  },
  {
    id: "zona-leste-01",
    name: "WEMOVELT Zona Leste",
    address: "Av. Aricanduva, 5678 - São Paulo",
    lat: -23.5428,
    lng: -46.4747,
    radius: 50,
  },
];

export const EQUIPMENTS: Equipment[] = [
  { id: "puxada-alta", name: "Puxada Alta", gymId: "zona-sul-01" },
  { id: "leg-press", name: "Leg Press", gymId: "zona-sul-01" },
  { id: "supino-reto", name: "Supino Reto", gymId: "zona-sul-01" },
  { id: "cadeira-extensora", name: "Cadeira Extensora", gymId: "zona-sul-01" },
  { id: "puxada-alta", name: "Puxada Alta", gymId: "zona-leste-01" },
  { id: "leg-press", name: "Leg Press", gymId: "zona-leste-01" },
  { id: "supino-reto", name: "Supino Reto", gymId: "zona-leste-01" },
  { id: "cadeira-extensora", name: "Cadeira Extensora", gymId: "zona-leste-01" },
];

export const getGymById = (id: string): Gym | undefined => {
  return GYMS.find((gym) => gym.id === id);
};

export const getEquipmentById = (id: string, gymId: string): Equipment | undefined => {
  return EQUIPMENTS.find((eq) => eq.id === id && eq.gymId === gymId);
};
