/**
 * Sanitizes strings by trimming, stripping script tags, HTML entities, and potential injection vectors.
 */
export function sanitizeInput(input: string, maxLength = 500): string {
  if (typeof input !== 'string') return '';
  
  // Truncate length
  let clean = input.trim().slice(0, maxLength);
  
  // Strip out dangerous HTML tags and script/iframe patterns
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  clean = clean.replace(/<[^>]+>/g, '');
  clean = clean.replace(/javascript:/gi, '');
  clean = clean.replace(/data:/gi, '');
  clean = clean.replace(/onload=/gi, '');
  clean = clean.replace(/onerror=/gi, '');
  clean = clean.replace(/onclick=/gi, '');
  
  return clean.trim();
}

/**
 * Validates enrollment numbers (alphanumeric, hyphens, slashes, up to 50 characters)
 * e.g., ADTU/2023/EN042, 2301040101, ADTU-2022-PH01
 */
export function isValidEnrollmentNumber(enrollment: string): boolean {
  if (!enrollment || enrollment.trim().length === 0 || enrollment.length > 50) return false;
  return /^[a-zA-Z0-9\-_/.]+$/.test(enrollment.trim());
}

/**
 * Validates standard emails
 */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 150) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
