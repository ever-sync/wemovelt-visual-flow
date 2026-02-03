/**
 * Sanitize text by trimming, removing HTML tags, and normalizing whitespace
 */
export const sanitizeText = (text: string): string => {
  return text
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' '); // Multiple spaces to single
};

/**
 * Sanitize a number value with min/max bounds
 * Returns null if value is empty, undefined, or invalid
 */
export const sanitizeNumber = (
  value: string | number | undefined | null,
  min: number,
  max: number
): number | null => {
  if (value === undefined || value === null || value === '') return null;
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return null;
  
  // Clamp to bounds
  return Math.min(Math.max(num, min), max);
};

/**
 * Sanitize an integer value with min/max bounds
 * Returns null if value is empty, undefined, or invalid
 */
export const sanitizeInteger = (
  value: string | number | undefined | null,
  min: number,
  max: number
): number | null => {
  const num = sanitizeNumber(value, min, max);
  if (num === null) return null;
  return Math.round(num);
};

/**
 * Sanitize a string for use in URLs or identifiers
 * Removes special characters and normalizes spacing
 */
export const sanitizeSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-'); // Multiple hyphens to single
};

/**
 * Validate and sanitize an email address
 * Returns the sanitized email or null if invalid
 */
export const sanitizeEmail = (email: string): string | null => {
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : null;
};
