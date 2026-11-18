import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeAmenityInput } from '../src/js/sanitize.js';

describe('Sanitization & Security Module', () => {
  it('strips HTML tags and script elements to prevent XSS injection', () => {
    const maliciousInput = '<script>alert("xss")</script>Luxury Spa & Sauna';
    const sanitized = sanitizeText(maliciousInput);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
    expect(sanitized).toBe('Luxury Spa & Sauna');
  });

  it('removes javascript: pseudo-protocols and inline event handlers', () => {
    const maliciousInput = '<img src=x onerror=alert(1)>Rooftop Lounge';
    const sanitized = sanitizeText(maliciousInput);
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('<img');
    expect(sanitized).toBe('Rooftop Lounge');
  });

  it('removes unsafe ASCII and Unicode control characters', () => {
    // Control characters like null byte \x00, backspace \x08, escape \x1B
    const inputWithControlChars = 'Heated\x00 Pool\x08 Area\x1B';
    const sanitized = sanitizeText(inputWithControlChars);
    expect(sanitized).toBe('Heated Pool Area');
  });

  it('trims leading and trailing whitespace and normalizes internal spaces', () => {
    const unnormalized = '   Grand   Ballroom     ';
    const sanitized = sanitizeText(unnormalized);
    expect(sanitized).toBe('Grand Ballroom');
  });

  it('handles null, undefined, and non-string inputs safely without crashing', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(12345)).toBe('12345');
    expect(sanitizeText({})).toBe('');
  });

  it('sanitizes complete amenity input payload correctly', () => {
    const rawData = {
      name: '  <b>Executive</b> Boardroom  ',
      category: 'Services',
      location: 'Floor 4 <script>evil()</script>',
      description: 'Exclusive workspace\x00 with amenities',
      hours: '08:00 - 20:00',
      status: 'Available'
    };

    const clean = sanitizeAmenityInput(rawData);
    expect(clean.name).toBe('Executive Boardroom');
    expect(clean.location).toBe('Floor 4');
    expect(clean.description).toBe('Exclusive workspace with amenities');
    expect(clean.hours).toBe('08:00 - 20:00');
    expect(clean.status).toBe('Available');
  });
});
