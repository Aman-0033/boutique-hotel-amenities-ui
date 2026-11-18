/**
 * State Management & Business Logic Module
 * Boutique Hotel Amenities UI - Ticket ENG-19777
 */

import { trackUserInteraction, ACTION_TYPES } from './analytics.js';

export class AppState {
  constructor(initialAmenities = []) {
    this.amenities = Array.isArray(initialAmenities) ? [...initialAmenities] : [];
    this.searchQuery = '';
    this.categoryFilter = 'all';
    this.statusFilter = 'all';
    this.sortBy = 'name-asc';
  }

  /**
   * Calculates dynamic overview metrics from underlying data.
   *
   * @returns {{ total: number, available: number, limited: number, unavailable: number }}
   */
  getMetrics() {
    let available = 0;
    let limited = 0;
    let unavailable = 0;

    for (const item of this.amenities) {
      const status = (item.status || '').toLowerCase();
      if (status === 'available') {
        available++;
      } else if (status === 'limited') {
        limited++;
      } else if (status === 'unavailable') {
        unavailable++;
      }
    }

    return {
      total: this.amenities.length,
      available,
      limited,
      unavailable
    };
  }

  /**
   * Sets the active search keyword.
   * @param {string} query
   */
  setSearchQuery(query) {
    this.searchQuery = (query || '').trim().toLowerCase();
  }

  /**
   * Sets category filter.
   * @param {string} category
   */
  setCategoryFilter(category) {
    this.categoryFilter = category || 'all';
  }

  /**
   * Sets availability status filter.
   * @param {string} status
   */
  setStatusFilter(status) {
    this.statusFilter = status || 'all';
  }

  /**
   * Sets sort criteria.
   * @param {string} sortKey
   */
  setSortBy(sortKey) {
    this.sortBy = sortKey || 'name-asc';
  }

  /**
   * Resets all search and filter values to initial view.
   */
  clearFilters() {
    this.searchQuery = '';
    this.categoryFilter = 'all';
    this.statusFilter = 'all';
    this.sortBy = 'name-asc';
  }

  /**
   * Returns filtered and sorted list of amenities.
   *
   * @returns {Array<Object>}
   */
  getFilteredAmenities() {
    let result = this.amenities.filter(item => {
      // 1. Search Query Match
      if (this.searchQuery) {
        const query = this.searchQuery;
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const locMatch = (item.location || '').toLowerCase().includes(query);
        const descMatch = (item.description || '').toLowerCase().includes(query);
        const catMatch = (item.category || '').toLowerCase().includes(query);
        if (!nameMatch && !locMatch && !descMatch && !catMatch) {
          return false;
        }
      }

      // 2. Category Filter
      if (this.categoryFilter !== 'all' && item.category !== this.categoryFilter) {
        return false;
      }

      // 3. Status Filter
      if (this.statusFilter !== 'all' && item.status !== this.statusFilter) {
        return false;
      }

      return true;
    });

    // 4. Sorting
    result.sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'updated-desc':
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        case 'updated-asc':
          return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
        default:
          return 0;
      }
    });

    return result;
  }

  /**
   * Retrieves single amenity by unique ID.
   * @param {string} id
   * @returns {Object|undefined}
   */
  getAmenityById(id) {
    return this.amenities.find(item => item.id === id);
  }

  /**
   * Adds a new amenity record with duplicate detection.
   *
   * @param {Object} data
   * @returns {Object} Newly created amenity
   */
  addAmenity(data) {
    const name = (data.name || '').trim();
    const location = (data.location || '').trim();

    // Prevent duplicate entries in the same hotel location
    const duplicate = this.amenities.find(
      item =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.location.toLowerCase() === location.toLowerCase()
    );

    if (duplicate) {
      throw new Error(`An amenity named "${name}" already exists at location "${location}".`);
    }

    const nowIso = new Date().toISOString();
    const newAmenity = {
      id: `amenity-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      category: data.category,
      location: data.location,
      description: data.description,
      hours: data.hours || 'Standard Hours',
      status: data.status || 'Available',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    this.amenities.unshift(newAmenity);
    trackUserInteraction(ACTION_TYPES.ADD_AMENITY, { id: newAmenity.id });
    return newAmenity;
  }

  /**
   * Updates an existing amenity record.
   *
   * @param {string} id
   * @param {Object} data
   * @returns {Object|null} Updated record or null
   */
  updateAmenity(id, data) {
    const index = this.amenities.findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }

    const existing = this.amenities[index];
    const isStatusOnly = Object.keys(data).length === 1 && data.status !== undefined;

    const updated = {
      ...existing,
      ...data,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    this.amenities[index] = updated;

    if (isStatusOnly) {
      trackUserInteraction(ACTION_TYPES.UPDATE_STATUS, { id });
    } else {
      trackUserInteraction(ACTION_TYPES.EDIT_AMENITY, { id });
    }

    return updated;
  }

  /**
   * Deletes an amenity record.
   *
   * @param {string} id
   * @returns {boolean} True if deleted
   */
  deleteAmenity(id) {
    const index = this.amenities.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }

    this.amenities.splice(index, 1);
    trackUserInteraction(ACTION_TYPES.DELETE_AMENITY, { id });
    return true;
  }
}
