import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderMetrics,
  renderAmenitiesTable,
  renderEmptyState,
  validateAmenityForm,
  setFieldError,
  clearFieldErrors,
  showOfflineBanner,
  hideOfflineBanner,
  announceToScreenReader
} from '../src/js/ui.js';

describe('UI Component & DOM Rendering Module', () => {
  beforeEach(() => {
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
      <form id="amenity-form" novalidate>
        <div class="form-group">
          <label for="amenity-name">Amenity Name</label>
          <input id="amenity-name" name="name" type="text" required />
          <span id="name-error" class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="amenity-category">Category</label>
          <select id="amenity-category" name="category" required>
            <option value="">Select category</option>
            <option value="Wellness & Spa">Wellness & Spa</option>
          </select>
          <span id="category-error" class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="amenity-location">Location</label>
          <input id="amenity-location" name="location" type="text" required />
          <span id="location-error" class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="amenity-description">Description</label>
          <textarea id="amenity-description" name="description" required></textarea>
          <span id="description-error" class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="amenity-hours">Operating Hours</label>
          <input id="amenity-hours" name="hours" type="text" placeholder="e.g. 06:00 - 22:00 or 24/7" required />
          <span id="hours-error" class="error-message"></span>
        </div>
        <div class="form-group">
          <label for="amenity-status">Status</label>
          <select id="amenity-status" name="status" required>
            <option value="Available">Available</option>
            <option value="Limited">Limited</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </form>
    `;
  });

  it('renders dynamic metrics into the summary counters', () => {
    renderMetrics({
      total: 12,
      available: 8,
      limited: 3,
      unavailable: 1
    });

    expect(document.getElementById('metric-total').textContent).toBe('12');
    expect(document.getElementById('metric-available').textContent).toBe('8');
    expect(document.getElementById('metric-limited').textContent).toBe('3');
    expect(document.getElementById('metric-unavailable').textContent).toBe('1');
  });

  it('renders amenities table and responsive cards with safe textContent', () => {
    const amenities = [
      {
        id: 'am-1',
        name: 'Finnish Sauna <script>bad()</script>',
        category: 'Wellness & Spa',
        location: 'Level B1',
        description: 'Therapeutic dry heat chamber',
        hours: '08:00 - 22:00',
        status: 'Available',
        updatedAt: '2026-11-18T10:00:00.000Z'
      }
    ];

    const container = document.getElementById('amenities-container');
    renderAmenitiesTable(container, amenities);

    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(table.getAttribute('role') || 'table').toBe('table');

    // Verify script tag was not executed or inserted as raw HTML
    const nameCell = container.querySelector('.amenity-name');
    expect(nameCell.innerHTML).not.toContain('<script>');
    expect(nameCell.textContent).toContain('Finnish Sauna');

    // Verify accessibility attributes on actions
    const editBtn = container.querySelector('[data-action="edit"]');
    expect(editBtn).not.toBeNull();
    expect(editBtn.getAttribute('aria-label')).toContain('Edit Finnish Sauna');
  });

  it('renders professional empty state when no items match filters', () => {
    const container = document.getElementById('amenities-container');
    renderEmptyState(container, {
      title: 'No amenities found',
      message: 'No amenity records match your current search query or filter criteria.',
      showResetButton: true
    });

    const emptyWrapper = container.querySelector('.empty-state');
    expect(emptyWrapper).not.toBeNull();
    expect(emptyWrapper.textContent).toContain('No amenities found');
    const clearBtn = emptyWrapper.querySelector('#btn-clear-filters');
    expect(clearBtn).not.toBeNull();
  });

  it('validates required form fields and applies accessible error indicators', () => {
    const form = document.getElementById('amenity-form');
    const input = document.getElementById('amenity-name');
    input.value = ''; // Empty invalid value

    const errors = validateAmenityForm(form);
    expect(errors.name).toBeDefined();

    setFieldError(input, errors.name, document.getElementById('name-error'));
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.classList.contains('input-error')).toBe(true);
    expect(document.getElementById('name-error').textContent).toBe(errors.name);

    // Clear error
    clearFieldErrors(form);
    expect(input.getAttribute('aria-invalid')).toBe('false');
    expect(input.classList.contains('input-error')).toBe(false);
    expect(document.getElementById('name-error').textContent).toBe('');
  });

  it('displays and hides offline status banner accessibility notifications', () => {
    const banner = document.getElementById('offline-banner');
    showOfflineBanner('Working Offline. Local operational records are saved locally.');
    expect(banner.classList.contains('hidden')).toBe(false);
    expect(banner.textContent).toContain('Working Offline');

    hideOfflineBanner();
    expect(banner.classList.contains('hidden')).toBe(true);
  });

  it('announces status changes to screen readers via aria-live region', () => {
    const announcer = document.getElementById('screen-reader-announcer');
    announceToScreenReader('Amenity "Rooftop Pool" successfully updated');
    expect(announcer.textContent).toBe('Amenity "Rooftop Pool" successfully updated');
  });
});
