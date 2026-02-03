export interface QRCodeData {
  gymId: string;
  equipmentId: string;
}

export interface QRValidationResult {
  valid: boolean;
  data?: QRCodeData;
  error?: string;
}

const QR_PREFIX = "wemovelt://";

/**
 * Parses a WEMOVELT QR Code and extracts gym/equipment IDs
 * Expected format: wemovelt://gym/{gymId}/equipment/{equipmentId}
 * 
 * Note: This only parses the QR code format. Validation against the database
 * should be done separately using the extracted IDs.
 */
export const parseQRCode = (rawData: string): QRValidationResult => {
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

  // Basic UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(gymId)) {
    return {
      valid: false,
      error: "ID da academia inválido",
    };
  }

  if (!uuidRegex.test(equipmentId)) {
    return {
      valid: false,
      error: "ID do equipamento inválido",
    };
  }

  return {
    valid: true,
    data: {
      gymId,
      equipmentId,
    },
  };
};

/**
 * Generates a valid QR Code string for testing
 */
export const generateQRCode = (gymId: string, equipmentId: string): string => {
  return `${QR_PREFIX}gym/${gymId}/equipment/${equipmentId}`;
};
