/**
 * Storage & Local Persistence Module
 * Boutique Hotel Amenities UI - Ticket ENG-19777
 *
 * Implements frontend-only persistence using browser localStorage.
 * Handles missing data, malformed JSON, and quota exceptions gracefully.
 */

import { INITIAL_AMENITIES } from './data.js';

export const STORAGE_KEY = 'boutique_hotel_amenities_v1';

/**
 * Loads amenity records from localStorage.
 * Seeds initial sample records if no storage exists.
 * Gracefully recovers from malformed data.
 *
 * @returns {Array<Object>} List of amenities
 */
export function loadAmenities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAmenities(INITIAL_AMENITIES);
      return JSON.parse(JSON.stringify(INITIAL_AMENITIES));
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[Storage] Stored amenities was not an array. Resetting to defaults.');
      saveAmenities(INITIAL_AMENITIES);
      return JSON.parse(JSON.stringify(INITIAL_AMENITIES));
    }

    return parsed;
  } catch (error) {
    console.warn('[Storage] Corrupted localStorage data encountered. Recovering with default dataset.', error);
    saveAmenities(INITIAL_AMENITIES);
    return JSON.parse(JSON.stringify(INITIAL_AMENITIES));
  }
}

/**
 * Persists the amenity list to localStorage.
 *
 * @param {Array<Object>} amenities - Array of amenity objects
 * @returns {boolean} True if persisted successfully, false on error
 */
export function saveAmenities(amenities) {
  try {
    if (!Array.isArray(amenities)) {
      return false;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(amenities));
    return true;
  } catch (error) {
    console.error('[Storage] Failed to save amenities to localStorage:', error);
    return false;
  }
}

/**
 * Resets local storage back to the initial sample dataset.
 *
 * @returns {Array<Object>} Freshly reset sample amenities
 */
export function resetAmenitiesToDefault() {
  const freshCopy = JSON.parse(JSON.stringify(INITIAL_AMENITIES));
  saveAmenities(freshCopy);
  return freshCopy;
}
