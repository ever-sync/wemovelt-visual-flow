import { getGymById, getEquipmentById } from "@/data/gyms";

export interface QRCodeData {
  gymId: string;
  equipmentId: string;
  gymName?: string;
  equipmentName?: string;
}

export interface QRValidationResult {
  valid: boolean;
  data?: QRCodeData;
  error?: string;
}

const QR_PREFIX = "wemovelt://";

/**
 * Validates and parses a WEMOVELT QR Code
 * Expected format: wemovelt://gym/{gymId}/equipment/{equipmentId}
 */
export const validateQRCode = (rawData: string): QRValidationResult => {
  // Check if it starts with our prefix
  if (!rawData.startsWith(QR_PREFIX)) {
    return {
      valid: false,
      error: "QR Code não reconhecido",
    };
  }

  // Remove prefix and parse
  const path = rawData.slice(QR_PREFIX.length);
  const parts = path.split("/");

  // Expected: gym/{gymId}/equipment/{equipmentId}
  if (parts.length !== 4 || parts[0] !== "gym" || parts[2] !== "equipment") {
    return {
      valid: false,
      error: "Formato de QR Code inválido",
    };
  }

  const gymId = parts[1];
  const equipmentId = parts[3];

  // Validate gym exists
  const gym = getGymById(gymId);
  if (!gym) {
    return {
      valid: false,
      error: "Academia não encontrada",
    };
  }

  // Validate equipment exists in this gym
  const equipment = getEquipmentById(equipmentId, gymId);
  if (!equipment) {
    return {
      valid: false,
      error: "Equipamento não encontrado nesta academia",
    };
  }

  return {
    valid: true,
    data: {
      gymId,
      equipmentId,
      gymName: gym.name,
      equipmentName: equipment.name,
    },
  };
};

/**
 * Generates a valid QR Code string for testing
 */
export const generateQRCode = (gymId: string, equipmentId: string): string => {
  return `${QR_PREFIX}gym/${gymId}/equipment/${equipmentId}`;
};
