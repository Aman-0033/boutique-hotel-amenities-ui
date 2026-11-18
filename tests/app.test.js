import { describe, it, expect, beforeEach } from 'vitest';
import { AppState } from '../src/js/state.js';
import { loadAmenities, saveAmenities, resetAmenitiesToDefault } from '../src/js/storage.js';
import { renderAmenitiesTable, renderMetrics, renderEmptyState } from '../src/js/ui.js';
import { sanitizeAmenityInput } from '../src/js/sanitize.js';

describe('App End-to-End Workflow & Integration', () => {
  let state;
  let container;

  beforeEach(() => {
    localStorage.clear();
    const data = resetAmenitiesToDefault();
    state = new AppState(data);

    document.body.innerHTML = `
      <div id="metrics-container">
        <span id="metric-total">0</span>
        <span id="metric-available">0</span>
        <span id="metric-limited">0</span>
        <span id="metric-unavailable">0</span>
      </div>
      <div id="amenities-container"></div>
      <div id="offline-banner" class="hidden" role="alert"></div>
      <div id="screen-reader-announcer" class="sr-only" aria-live="polite"></div>
    `;

    container = document.getElementById('amenities-container');
    renderMetrics(state.getMetrics());
    renderAmenitiesTable(container, state.getFilteredAmenities());
  });

  it('initializes with sample records and renders table and cards', () => {
    const rows = container.querySelectorAll('.amenity-row');
    const cards = container.querySelectorAll('.amenity-card');
    expect(rows.length).toBe(state.amenities.length);
    expect(cards.length).toBe(state.amenities.length);
    expect(document.getElementById('metric-total').textContent).toBe(String(state.amenities.length));
  });

  it('filters amenities when search keyword changes', () => {
    state.setSearchQuery('sauna');
    renderAmenitiesTable(container, state.getFilteredAmenities());

    const rows = container.querySelectorAll('.amenity-row');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('Nordic Cedarwood Sauna');
  });

  it('filters amenities by category selection', () => {
    state.setCategoryFilter('Dining & Lounge');
    renderAmenitiesTable(container, state.getFilteredAmenities());

    const rows = container.querySelectorAll('.amenity-row');
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach(r => {
      expect(r.textContent).toContain('Dining & Lounge');
    });
  });

  it('updates an amenity availability status and refreshes metrics', () => {
    const firstAmenity = state.amenities[0];
    const newStatus = firstAmenity.status === 'Available' ? 'Unavailable' : 'Available';

    state.updateAmenity(firstAmenity.id, { status: newStatus });
    saveAmenities(state.amenities);

    renderMetrics(state.getMetrics());
    renderAmenitiesTable(container, state.getFilteredAmenities());

    const updatedRow = container.querySelector(`[data-id="${firstAmenity.id}"]`);
    expect(updatedRow.textContent).toContain(newStatus);
  });

  it('adds a new amenity through sanitized form submission and persists it', () => {
    const rawInput = {
      name: '  <b>Starlight</b> Observatory Deck  ',
      category: 'Recreation',
      location: 'Tower Pinnacle <script>xss()</script>',
      description: 'High-magnification astronomical telescopes with on-call astronomer.',
      hours: '20:00 - 02:00',
      status: 'Available'
    };

    const sanitized = sanitizeAmenityInput(rawInput);
    const created = state.addAmenity(sanitized);
    saveAmenities(state.amenities);

    renderMetrics(state.getMetrics());
    renderAmenitiesTable(container, state.getFilteredAmenities());

    expect(created.name).toBe('Starlight Observatory Deck');
    expect(created.location).toBe('Tower Pinnacle');

    const loadedFromDisk = loadAmenities();
    expect(loadedFromDisk.some(item => item.name === 'Starlight Observatory Deck')).toBe(true);
  });

  it('deletes an amenity and updates both DOM and persistence', () => {
    const initialCount = state.amenities.length;
    const itemToDelete = state.amenities[0];

    const deleted = state.deleteAmenity(itemToDelete.id);
    expect(deleted).toBe(true);
    saveAmenities(state.amenities);

    renderMetrics(state.getMetrics());
    renderAmenitiesTable(container, state.getFilteredAmenities());

    expect(state.amenities.length).toBe(initialCount - 1);
    const loaded = loadAmenities();
    expect(loaded.length).toBe(initialCount - 1);
    expect(loaded.some(item => item.id === itemToDelete.id)).toBe(false);
  });

  it('renders empty state when all filters yield zero matches and allows clearing', () => {
    state.setSearchQuery('NonExistentTermXYZ');
    const filtered = state.getFilteredAmenities();
    expect(filtered.length).toBe(0);

    renderEmptyState(container, {
      title: 'No matching amenities found',
      message: 'Try adjusting your search terms or clearing your filters.',
      showResetButton: true
    });

    expect(container.querySelector('.empty-state')).not.toBeNull();
    expect(container.querySelector('#btn-clear-filters')).not.toBeNull();

    // Clear filters
    state.clearFilters();
    renderAmenitiesTable(container, state.getFilteredAmenities());
    expect(container.querySelectorAll('.amenity-row').length).toBe(state.amenities.length);
  });
});
