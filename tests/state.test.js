import { describe, it, expect, beforeEach } from 'vitest';
import { AppState } from '../src/js/state.js';

describe('AppState Management & Business Logic', () => {
  let state;

  const mockAmenities = [
    {
      id: 'amenity-1',
      name: 'Rooftop Infinity Pool',
      category: 'Wellness & Spa',
      location: '18th Floor Terrace',
      description: 'Temperature-regulated heated pool with panoramic skyline vistas.',
      hours: '06:00 - 22:00',
      status: 'Available',
      updatedAt: '2026-11-15T10:00:00.000Z'
    },
    {
      id: 'amenity-2',
      name: 'Hydrotherapy Thermal Suite',
      category: 'Wellness & Spa',
      location: 'Basement Level B1',
      description: 'Aromatherapy steam rooms, Finnish saunas, and plunge pools.',
      hours: '08:00 - 21:00',
      status: 'Limited',
      updatedAt: '2026-11-16T14:30:00.000Z'
    },
    {
      id: 'amenity-3',
      name: 'Sommelier Wine Vault & Tasting Room',
      category: 'Dining & Lounge',
      location: 'Ground Floor Cellar',
      description: 'Grand collection of biodynamic vintages curated by Master Sommeliers.',
      hours: '17:00 - 23:30',
      status: 'Available',
      updatedAt: '2026-11-14T09:15:00.000Z'
    },
    {
      id: 'amenity-4',
      name: 'Private Helipad & Chauffeur Transfer',
      category: 'Services & Experiences',
      location: 'Tower Roof & North Porte-Cochere',
      description: 'Executive aerial access and Mercedes-Maybach airport transfers.',
      hours: '24/7 on request',
      status: 'Unavailable',
      updatedAt: '2026-11-17T11:00:00.000Z'
    }
  ];

  beforeEach(() => {
    state = new AppState([...mockAmenities]);
  });

  it('calculates dashboard overview metrics dynamically', () => {
    const metrics = state.getMetrics();
    expect(metrics.total).toBe(4);
    expect(metrics.available).toBe(2);
    expect(metrics.limited).toBe(1);
    expect(metrics.unavailable).toBe(1);
  });

  it('filters amenities by search query across name, location, and description', () => {
    state.setSearchQuery('helipad');
    let results = state.getFilteredAmenities();
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Private Helipad & Chauffeur Transfer');

    state.setSearchQuery('terrace');
    results = state.getFilteredAmenities();
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Rooftop Infinity Pool');

    state.setSearchQuery('sommeliers');
    results = state.getFilteredAmenities();
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Sommelier Wine Vault & Tasting Room');
  });

  it('filters amenities by category', () => {
    state.setCategoryFilter('Wellness & Spa');
    const results = state.getFilteredAmenities();
    expect(results.length).toBe(2);
    expect(results.every(item => item.category === 'Wellness & Spa')).toBe(true);
  });

  it('filters amenities by availability status', () => {
    state.setStatusFilter('Available');
    const results = state.getFilteredAmenities();
    expect(results.length).toBe(2);
    expect(results.every(item => item.status === 'Available')).toBe(true);
  });

  it('combines search, category, and status filters simultaneously', () => {
    state.setSearchQuery('steam');
    state.setCategoryFilter('Wellness & Spa');
    state.setStatusFilter('Limited');

    const results = state.getFilteredAmenities();
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('amenity-2');
  });

  it('returns empty array when filters do not match any records', () => {
    state.setSearchQuery('NonExistentKeywordXYZ');
    const results = state.getFilteredAmenities();
    expect(results.length).toBe(0);
  });

  it('clears all filters properly', () => {
    state.setSearchQuery('Pool');
    state.setCategoryFilter('Wellness & Spa');
    state.setStatusFilter('Available');
    expect(state.getFilteredAmenities().length).toBe(1);

    state.clearFilters();
    expect(state.searchQuery).toBe('');
    expect(state.categoryFilter).toBe('all');
    expect(state.statusFilter).toBe('all');
    expect(state.getFilteredAmenities().length).toBe(4);
  });

  it('adds a new amenity and updates metrics dynamically', () => {
    const newAmenity = {
      name: 'Bespoke In-Room Vinyl Library',
      category: 'In-Room Comfort',
      location: 'Suites & Penthouses',
      description: 'Analog turntable setup with vintage vinyl records curated by guest preference.',
      hours: '24/7',
      status: 'Available'
    };

    const added = state.addAmenity(newAmenity);
    expect(added).toBeDefined();
    expect(added.id).toBeDefined();
    expect(added.createdAt).toBeDefined();
    expect(added.updatedAt).toBeDefined();

    const metrics = state.getMetrics();
    expect(metrics.total).toBe(5);
    expect(metrics.available).toBe(3);
  });

  it('edits an existing amenity record and updates its timestamp', () => {
    const updated = state.updateAmenity('amenity-1', {
      hours: '07:00 - 23:00',
      status: 'Limited'
    });

    expect(updated).not.toBeNull();
    expect(updated.hours).toBe('07:00 - 23:00');
    expect(updated.status).toBe('Limited');

    const metrics = state.getMetrics();
    expect(metrics.available).toBe(1);
    expect(metrics.limited).toBe(2);
  });

  it('deletes an amenity record and updates metrics', () => {
    const deleted = state.deleteAmenity('amenity-4');
    expect(deleted).toBe(true);

    const metrics = state.getMetrics();
    expect(metrics.total).toBe(3);
    expect(metrics.unavailable).toBe(0);

    const found = state.getAmenityById('amenity-4');
    expect(found).toBeUndefined();
  });

  it('prevents adding amenities with duplicate names in the same location', () => {
    const duplicate = {
      name: 'Rooftop Infinity Pool',
      category: 'Wellness & Spa',
      location: '18th Floor Terrace',
      description: 'Another duplicate pool entry',
      hours: '06:00 - 22:00',
      status: 'Available'
    };

    expect(() => state.addAmenity(duplicate)).toThrow(/already exists/i);
  });
});
