/**
 * UI Rendering & DOM Manipulation Module
 * Boutique Hotel Amenities UI - Ticket ENG-19777
 *
 * Implements accessible, semantic rendering adhering to strict
 * monochromatic hospitality design standards and XSS protection.
 */

/**
 * Updates dynamic metric values in the summary counters.
 *
 * @param {{ total: number, available: number, limited: number, unavailable: number }} metrics
 */
export function renderMetrics(metrics) {
  const totalEl = document.getElementById('metric-total');
  const availEl = document.getElementById('metric-available');
  const limitedEl = document.getElementById('metric-limited');
  const unavailEl = document.getElementById('metric-unavailable');

  if (totalEl) totalEl.textContent = String(metrics.total ?? 0);
  if (availEl) availEl.textContent = String(metrics.available ?? 0);
  if (limitedEl) limitedEl.textContent = String(metrics.limited ?? 0);
  if (unavailEl) unavailEl.textContent = String(metrics.unavailable ?? 0);
}

/**
 * Formats an ISO date string into human-readable luxury timestamp.
 *
 * @param {string} isoString
 * @returns {string} Formatted date string
 */
export function formatTimestamp(isoString) {
  if (!isoString) return 'Recently';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Recently';
  }
}

/**
 * Creates a status badge element.
 *
 * @param {string} status - Available, Limited, or Unavailable
 * @returns {HTMLSpanElement}
 */
export function createStatusBadge(status) {
  const badge = document.createElement('span');
  const normalized = (status || 'Available').toLowerCase();
  badge.className = `status-badge status-${normalized}`;

  const dot = document.createElement('span');
  dot.className = 'status-dot';
  dot.setAttribute('aria-hidden', 'true');

  const text = document.createElement('span');
  text.textContent = status;

  badge.appendChild(dot);
  badge.appendChild(text);
  return badge;
}

/**
 * Renders the amenities table (for desktop) and responsive cards (for tablet/mobile).
 * Uses textContent and programmatic DOM creation to guarantee zero XSS risks.
 *
 * @param {HTMLElement} container - DOM container element
 * @param {Array<Object>} amenities - Array of amenity records
 */
export function renderAmenitiesTable(container, amenities) {
  if (!container) return;
  container.innerHTML = '';

  if (!amenities || amenities.length === 0) {
    return;
  }

  // Wrapper for responsive table
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'table-responsive-wrapper';

  const table = document.createElement('table');
  table.className = 'amenities-table';
  table.setAttribute('role', 'table');
  table.setAttribute('aria-label', 'Boutique Hotel Amenities Master Register');

  // Table Head
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const headers = [
    { text: 'Amenity & Location', scope: 'col', class: 'col-amenity' },
    { text: 'Category', scope: 'col', class: 'col-category' },
    { text: 'Operating Hours', scope: 'col', class: 'col-hours' },
    { text: 'Availability Status', scope: 'col', class: 'col-status' },
    { text: 'Last Updated', scope: 'col', class: 'col-updated' },
    { text: 'Staff Actions', scope: 'col', class: 'col-actions' }
  ];

  headers.forEach(h => {
    const th = document.createElement('th');
    th.setAttribute('scope', h.scope);
    th.className = h.class;
    th.textContent = h.text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Table Body
  const tbody = document.createElement('tbody');

  amenities.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'amenity-row';
    tr.dataset.id = item.id;

    // 1. Amenity Name & Location
    const tdAmenity = document.createElement('td');
    tdAmenity.className = 'cell-amenity';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'amenity-title-wrap';

    const nameEl = document.createElement('strong');
    nameEl.className = 'amenity-name';
    nameEl.textContent = item.name;

    const locEl = document.createElement('span');
    locEl.className = 'amenity-location';
    locEl.textContent = item.location;

    titleWrap.appendChild(nameEl);
    titleWrap.appendChild(locEl);
    tdAmenity.appendChild(titleWrap);
    tr.appendChild(tdAmenity);

    // 2. Category
    const tdCategory = document.createElement('td');
    tdCategory.className = 'cell-category';
    const catBadge = document.createElement('span');
    catBadge.className = 'category-pill';
    catBadge.textContent = item.category;
    tdCategory.appendChild(catBadge);
    tr.appendChild(tdCategory);

    // 3. Operating Hours
    const tdHours = document.createElement('td');
    tdHours.className = 'cell-hours';
    tdHours.textContent = item.hours || '24/7';
    tr.appendChild(tdHours);

    // 4. Status Badge & Quick Status Selector
    const tdStatus = document.createElement('td');
    tdStatus.className = 'cell-status';

    const statusWrapper = document.createElement('div');
    statusWrapper.className = 'status-wrapper';

    const badge = createStatusBadge(item.status);
    statusWrapper.appendChild(badge);

    // Quick status dropdown for staff efficiency
    const statusSelect = document.createElement('select');
    statusSelect.className = 'quick-status-select';
    statusSelect.dataset.action = 'quick-status';
    statusSelect.dataset.id = item.id;
    statusSelect.setAttribute('aria-label', `Quick update availability for ${item.name}`);

    ['Available', 'Limited', 'Unavailable'].forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      if (s.toLowerCase() === (item.status || '').toLowerCase()) {
        opt.selected = true;
      }
      statusSelect.appendChild(opt);
    });

    statusWrapper.appendChild(statusSelect);
    tdStatus.appendChild(statusWrapper);
    tr.appendChild(tdStatus);

    // 5. Last Updated
    const tdUpdated = document.createElement('td');
    tdUpdated.className = 'cell-updated';
    tdUpdated.textContent = formatTimestamp(item.updatedAt);
    tr.appendChild(tdUpdated);

    // 6. Actions
    const tdActions = document.createElement('td');
    tdActions.className = 'cell-actions';

    const actionGroup = document.createElement('div');
    actionGroup.className = 'action-btn-group';

    // View Details Button
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.className = 'btn-icon';
    viewBtn.dataset.action = 'view';
    viewBtn.dataset.id = item.id;
    viewBtn.setAttribute('aria-label', `View details for ${item.name}`);
    viewBtn.title = 'View details';
    viewBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-icon';
    editBtn.dataset.action = 'edit';
    editBtn.dataset.id = item.id;
    editBtn.setAttribute('aria-label', `Edit ${item.name}`);
    editBtn.title = 'Edit amenity';
    editBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
      </svg>
    `;

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-icon btn-icon-danger';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = item.id;
    deleteBtn.setAttribute('aria-label', `Delete ${item.name}`);
    deleteBtn.title = 'Delete amenity';
    deleteBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
      </svg>
    `;

    actionGroup.appendChild(viewBtn);
    actionGroup.appendChild(editBtn);
    actionGroup.appendChild(deleteBtn);
    tdActions.appendChild(actionGroup);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);

  // Also render Mobile/Tablet Cards Container
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'amenities-cards-wrapper';

  amenities.forEach(item => {
    const card = document.createElement('article');
    card.className = 'amenity-card';
    card.dataset.id = item.id;

    // Header with title and status
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title';
    cardTitle.textContent = item.name;

    const badge = createStatusBadge(item.status);
    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(badge);
    card.appendChild(cardHeader);

    // Metadata: Category & Location
    const metaWrap = document.createElement('div');
    metaWrap.className = 'card-meta';

    const catEl = document.createElement('span');
    catEl.className = 'category-pill';
    catEl.textContent = item.category;

    const locEl = document.createElement('span');
    locEl.className = 'card-location';
    locEl.textContent = item.location;

    metaWrap.appendChild(catEl);
    metaWrap.appendChild(locEl);
    card.appendChild(metaWrap);

    // Description snippet
    const descEl = document.createElement('p');
    descEl.className = 'card-description';
    descEl.textContent = item.description;
    card.appendChild(descEl);

    // Card Footer: Hours & Actions
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';

    const hoursEl = document.createElement('span');
    hoursEl.className = 'card-hours';
    hoursEl.textContent = `Hours: ${item.hours || '24/7'}`;

    const cardActions = document.createElement('div');
    cardActions.className = 'action-btn-group';

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.className = 'btn-secondary btn-sm';
    viewBtn.dataset.action = 'view';
    viewBtn.dataset.id = item.id;
    viewBtn.setAttribute('aria-label', `View details for ${item.name}`);
    viewBtn.textContent = 'View';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-secondary btn-sm';
    editBtn.dataset.action = 'edit';
    editBtn.dataset.id = item.id;
    editBtn.setAttribute('aria-label', `Edit ${item.name}`);
    editBtn.textContent = 'Edit';

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-danger btn-sm';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = item.id;
    deleteBtn.setAttribute('aria-label', `Delete ${item.name}`);
    deleteBtn.textContent = 'Delete';

    cardActions.appendChild(viewBtn);
    cardActions.appendChild(editBtn);
    cardActions.appendChild(deleteBtn);

    cardFooter.appendChild(hoursEl);
    cardFooter.appendChild(cardActions);
    card.appendChild(cardFooter);

    cardsWrapper.appendChild(card);
  });

  container.appendChild(cardsWrapper);
}

/**
 * Renders an accessible, refined empty state.
 *
 * @param {HTMLElement} container
 * @param {Object} options
 */
export function renderEmptyState(container, options = {}) {
  if (!container) return;
  container.innerHTML = '';

  const {
    title = 'No data found',
    message = 'No amenity records match your search criteria.',
    showResetButton = false,
    showAddButton = false
  } = options;

  const emptyDiv = document.createElement('div');
  emptyDiv.className = 'empty-state';
  emptyDiv.setAttribute('role', 'status');

  const iconWrap = document.createElement('div');
  iconWrap.className = 'empty-icon-wrap';
  iconWrap.setAttribute('aria-hidden', 'true');
  iconWrap.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
      <path d="M8 11h6"/>
    </svg>
  `;

  const h3 = document.createElement('h3');
  h3.className = 'empty-title';
  h3.textContent = title;

  const p = document.createElement('p');
  p.className = 'empty-message';
  p.textContent = message;

  emptyDiv.appendChild(iconWrap);
  emptyDiv.appendChild(h3);
  emptyDiv.appendChild(p);

  const actionsWrap = document.createElement('div');
  actionsWrap.className = 'empty-actions';

  if (showResetButton) {
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.id = 'btn-clear-filters';
    clearBtn.className = 'btn-secondary';
    clearBtn.textContent = 'Clear All Filters';
    actionsWrap.appendChild(clearBtn);
  }

  if (showAddButton) {
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.id = 'btn-empty-add';
    addBtn.className = 'btn-primary';
    addBtn.textContent = '+ Add New Amenity';
    actionsWrap.appendChild(addBtn);
  }

  if (showResetButton || showAddButton) {
    emptyDiv.appendChild(actionsWrap);
  }

  container.appendChild(emptyDiv);
}

/**
 * Validates amenity form inputs.
 *
 * @param {HTMLFormElement} form
 * @returns {Object} Object with field names as keys and error strings as values
 */
export function validateAmenityForm(form) {
  const errors = {};
  if (!form) return errors;

  const nameVal = (form.name?.value || '').trim();
  const categoryVal = (form.category?.value || '').trim();
  const locationVal = (form.location?.value || '').trim();
  const descriptionVal = (form.description?.value || '').trim();
  const hoursVal = (form.hours?.value || '').trim();
  const statusVal = (form.status?.value || '').trim();

  // Name validation
  if (!nameVal) {
    errors.name = 'Amenity name is required.';
  } else if (nameVal.length < 2) {
    errors.name = 'Amenity name must be at least 2 characters.';
  } else if (nameVal.length > 80) {
    errors.name = 'Amenity name cannot exceed 80 characters.';
  }

  // Category validation
  if (!categoryVal) {
    errors.category = 'Please select an amenity category.';
  }

  // Location validation
  if (!locationVal) {
    errors.location = 'Operational location is required.';
  } else if (locationVal.length < 2) {
    errors.location = 'Location must be at least 2 characters.';
  } else if (locationVal.length > 100) {
    errors.location = 'Location cannot exceed 100 characters.';
  }

  // Description validation
  if (!descriptionVal) {
    errors.description = 'Amenity description is required.';
  } else if (descriptionVal.length < 5) {
    errors.description = 'Description must be at least 5 characters.';
  } else if (descriptionVal.length > 500) {
    errors.description = 'Description cannot exceed 500 characters.';
  }

  // Hours validation
  if (!hoursVal) {
    errors.hours = 'Operating hours are required (e.g. "06:00 - 22:00" or "24/7").';
  } else if (hoursVal.length < 2 || hoursVal.length > 60) {
    errors.hours = 'Operating hours must be between 2 and 60 characters.';
  }

  // Status validation
  const validStatuses = ['Available', 'Limited', 'Unavailable'];
  if (!statusVal || !validStatuses.includes(statusVal)) {
    errors.status = 'Please select a valid availability status.';
  }

  return errors;
}

/**
 * Sets an accessible error state on an input field.
 *
 * @param {HTMLElement} input
 * @param {string} message
 * @param {HTMLElement} errorSpan
 */
export function setFieldError(input, message, errorSpan) {
  if (input) {
    input.setAttribute('aria-invalid', 'true');
    input.classList.add('input-error');
  }
  if (errorSpan) {
    errorSpan.textContent = message || '';
  }
}

/**
 * Clears all error states from a form.
 *
 * @param {HTMLFormElement} form
 */
export function clearFieldErrors(form) {
  if (!form) return;
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.setAttribute('aria-invalid', 'false');
    input.classList.remove('input-error');
  });

  const errorSpans = form.querySelectorAll('.error-message');
  errorSpans.forEach(span => {
    span.textContent = '';
  });
}

/**
 * Displays the offline connectivity banner.
 *
 * @param {string} message
 */
export function showOfflineBanner(message) {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.textContent = message || 'Working Offline. Local operational records are saved locally.';
    banner.classList.remove('hidden');
  }
}

/**
 * Hides the offline connectivity banner.
 */
export function hideOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.classList.add('hidden');
    banner.textContent = '';
  }
}

/**
 * Announces dynamic status updates to screen readers via aria-live region.
 *
 * @param {string} message
 */
export function announceToScreenReader(message) {
  const announcer = document.getElementById('screen-reader-announcer');
  if (announcer) {
    announcer.textContent = message;
  }
}
