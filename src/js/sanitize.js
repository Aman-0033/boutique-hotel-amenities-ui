/**
 * Security & Input Sanitization Module
 * Boutique Hotel Amenities UI - Ticket ENG-19777
 *
 * Implements strict sanitization against XSS, control characters,
 * and malformed inputs before placing data into application state.
 */

/**
 * Sanitizes a single string input.
 * Strips HTML tags, removes unsafe control characters, trims, and normalizes spacing.
 *
 * @param {*} input - Value to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeText(input) {
  if (input === null || input === undefined) {
    return '';
  }

  if (typeof input !== 'string') {
    if (typeof input === 'number' || typeof input === 'boolean') {
      return String(input);
    }
    return '';
  }

  let text = input;

  // 1. Remove dangerous script and style tags and their contents
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // 3. Remove inline javascript: / data: pseudo-protocols
  text = text.replace(/(?:javascript|data|vbscript):/gi, '');

  // 4. Remove ASCII and Unicode control characters (\x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F-\x9F)
  // Preserves standard printable characters and common international text characters
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  // 5. Normalize internal whitespace sequences and trim extremities
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Sanitizes an amenity payload object.
 *
 * @param {Object} data - Raw amenity data
 * @returns {Object} Sanitized amenity data
 */
export function sanitizeAmenityInput(data) {
  if (!data || typeof data !== 'object') {
    return {};
  }

  return {
    name: sanitizeText(data.name),
    category: sanitizeText(data.category),
    location: sanitizeText(data.location),
    description: sanitizeText(data.description),
    hours: sanitizeText(data.hours),
    status: sanitizeText(data.status) || 'Available'
  };
}
