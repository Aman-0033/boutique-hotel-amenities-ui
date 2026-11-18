import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadAmenities, saveAmenities, resetAmenitiesToDefault, STORAGE_KEY } from '../src/js/storage.js';
import { INITIAL_AMENITIES } from '../src/js/data.js';

describe('Storage Module & Local Data Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads default sample amenities when storage is empty', () => {
    const data = loadAmenities();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(INITIAL_AMENITIES.length);
    expect(data[0].name).toBe(INITIAL_AMENITIES[0].name);
  });

  it('saves and reloads custom amenity records successfully', () => {
    const customList = [
      {
        id: 'amenity-custom-1',
        name: 'Private Cigar Lounge',
        category: 'Dining & Lounge',
        location: 'Mezzanine Level',
        description: 'Curated selection of cigars and rare spirits.',
        hours: '17:00 - 01:00',
        status: 'Available',
        updatedAt: '2026-11-19T00:00:00.000Z'
      }
    ];

    const saved = saveAmenities(customList);
    expect(saved).toBe(true);

    const reloaded = loadAmenities();
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].name).toBe('Private Cigar Lounge');
  });

  it('gracefully handles corrupted or malformed localStorage JSON without crashing', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(STORAGE_KEY, '{invalid-json:broken');

    const data = loadAmenities();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(INITIAL_AMENITIES.length);
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('resets amenities back to initial sample records on demand', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    expect(loadAmenities().length).toBe(0);

    const resetData = resetAmenitiesToDefault();
    expect(resetData.length).toBe(INITIAL_AMENITIES.length);
    expect(loadAmenities().length).toBe(INITIAL_AMENITIES.length);
  });

  it('handles localStorage quota or write errors gracefully and returns false', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const success = saveAmenities([{ id: '1', name: 'Test' }]);
    expect(success).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
