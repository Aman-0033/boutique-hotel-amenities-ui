/**
 * Main Application Orchestration Module
 * Boutique Hotel Amenities UI - Ticket ENG-19777
 *
 * Coordinates state, storage, UI rendering, modal dialogs,
 * keyboard accessibility, search/filter debounce, and offline events.
 */

import { AppState } from './state.js';
import {
  loadAmenities,
  saveAmenities,
  resetAmenitiesToDefault
} from './storage.js';
import {
  renderMetrics,
  renderAmenitiesTable,
  renderEmptyState,
  validateAmenityForm,
  setFieldError,
  clearFieldErrors,
  showOfflineBanner,
  hideOfflineBanner,
  announceToScreenReader,
  formatTimestamp
} from './ui.js';
import { sanitizeAmenityInput } from './sanitize.js';

class AppController {
  constructor() {
    this.state = null;
    this.activeModal = null;
    this.lastFocusedElement = null;
    this.pendingDeleteId = null;
    this.editingAmenityId = null;
    this.searchDebounceTimer = null;
  }

  /**
   * Initializes the application.
   */
  init() {
    // 1. Load data & initialize AppState
    const initialData = loadAmenities();
    this.state = new AppState(initialData);

    // 2. Cache DOM Elements
    this.cacheElements();

    // 3. Setup Connectivity Listeners
    this.setupConnectivity();

    // 4. Attach Event Handlers
    this.attachEventListeners();

    // 5. Initial Render
    this.render();

    // 6. Announce readiness
    announceToScreenReader('Boutique Hotel Amenities management portal loaded.');
  }

  /**
   * Caches frequently accessed DOM nodes.
   */
  cacheElements() {
    // Navigation & Layout
    this.sidebarNav = document.getElementById('sidebar-nav');
    this.mobileNavToggle = document.getElementById('mobile-nav-toggle');
    this.mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
    this.amenitiesContainer = document.getElementById('amenities-container');
    this.networkStatusPill = document.getElementById('network-status-pill');
    this.networkStatusText = document.getElementById('network-status-text');

    // Search & Filter Controls
    this.searchInput = document.getElementById('search-input');
    this.searchClearBtn = document.getElementById('search-clear-btn');
    this.categorySelect = document.getElementById('category-filter');
    this.statusSelect = document.getElementById('status-filter');
    this.sortSelect = document.getElementById('sort-filter');
    this.clearFiltersBtn = document.getElementById('clear-filters-btn');
    this.resultsCountEl = document.getElementById('results-count');

    // Primary Actions
    this.btnOpenAddModal = document.getElementById('btn-open-add-modal');
    this.btnResetData = document.getElementById('btn-reset-data');

    // Modals
    this.amenityModal = document.getElementById('amenity-modal');
    this.amenityForm = document.getElementById('amenity-form');
    this.modalTitle = document.getElementById('modal-title');
    this.deleteModal = document.getElementById('delete-modal');
    this.deleteAmenityNameEl = document.getElementById('delete-amenity-name');
    this.btnConfirmDelete = document.getElementById('btn-confirm-delete');
    this.viewModal = document.getElementById('view-modal');
    this.viewDetailsContainer = document.getElementById('view-details-content');

    // Loading overlay
    this.loadingOverlay = document.getElementById('loading-overlay');
    this.toastContainer = document.getElementById('toast-container');
  }

  /**
   * Configures online/offline status handling.
   */
  setupConnectivity() {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      if (isOnline) {
        hideOfflineBanner();
        if (this.networkStatusPill) {
          this.networkStatusPill.className = 'status-badge status-available';
        }
        if (this.networkStatusText) {
          this.networkStatusText.textContent = 'Operational (Online)';
        }
      } else {
        showOfflineBanner('Staff Notice: You are working offline. Operational changes are preserved in local storage.');
        if (this.networkStatusPill) {
          this.networkStatusPill.className = 'status-badge status-unavailable';
        }
        if (this.networkStatusText) {
          this.networkStatusText.textContent = 'Device Offline (Local Mode)';
        }
        announceToScreenReader('Internet connection lost. Local operational mode active.');
      }
    };

    window.addEventListener('online', () => {
      updateStatus();
      this.showToast('Reconnected. Operational sync active.', 'success');
      announceToScreenReader('Network restored.');
    });

    window.addEventListener('offline', () => {
      updateStatus();
      this.showToast('Offline mode. Changes saved locally.', 'warning');
    });

    updateStatus();
  }

  /**
   * Attaches interactive DOM listeners.
   */
  attachEventListeners() {
    // 1. Search input with 250ms debounce
    this.searchInput?.addEventListener('input', e => {
      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        this.state.setSearchQuery(e.target.value);
        this.renderAmenities();
        if (this.searchClearBtn) {
          this.searchClearBtn.classList.toggle('hidden', !e.target.value);
        }
      }, 250);
    });

    // Clear search button
    this.searchClearBtn?.addEventListener('click', () => {
      this.searchInput.value = '';
      this.state.setSearchQuery('');
      this.searchClearBtn.classList.add('hidden');
      this.searchInput.focus();
      this.renderAmenities();
    });

    // Keyboard shortcut '/' to focus search
    window.addEventListener('keydown', e => {
      if (
        e.key === '/' &&
        document.activeElement !== this.searchInput &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        this.searchInput?.focus();
      }
    });

    // 2. Filter dropdowns
    this.categorySelect?.addEventListener('change', e => {
      this.state.setCategoryFilter(e.target.value);
      this.syncSidebarActiveState(e.target.value);
      this.renderAmenities();
    });

    this.statusSelect?.addEventListener('change', e => {
      this.state.setStatusFilter(e.target.value);
      this.renderAmenities();
    });

    this.sortSelect?.addEventListener('change', e => {
      this.state.setSortBy(e.target.value);
      this.renderAmenities();
    });

    // Clear filters button
    this.clearFiltersBtn?.addEventListener('click', () => {
      this.handleClearFilters();
    });

    // 3. Sidebar Navigation Links
    this.sidebarNav?.addEventListener('click', e => {
      const link = e.target.closest('.nav-item');
      if (!link) return;
      e.preventDefault();

      const category = link.dataset.category || 'all';
      this.state.setCategoryFilter(category);
      if (this.categorySelect) {
        this.categorySelect.value = category;
      }
      this.syncSidebarActiveState(category);
      this.renderAmenities();

      // Close mobile drawer if open
      this.closeMobileNav();
    });

    // Mobile nav toggle
    this.mobileNavToggle?.addEventListener('click', () => {
      this.toggleMobileNav();
    });
    this.mobileNavBackdrop?.addEventListener('click', () => {
      this.closeMobileNav();
    });

    // 4. Action Delegation inside Amenities Container
    this.amenitiesContainer?.addEventListener('click', e => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.dataset.action;
      const id = target.dataset.id;

      if (action === 'view') {
        this.openViewModal(id);
      } else if (action === 'edit') {
        this.openEditModal(id);
      } else if (action === 'delete') {
        this.openDeleteModal(id);
      }
    });

    // Inline Quick Status Select
    this.amenitiesContainer?.addEventListener('change', e => {
      const target = e.target;
      if (target.dataset.action === 'quick-status') {
        const id = target.dataset.id;
        const newStatus = target.value;
        this.handleQuickStatusChange(id, newStatus);
      }
    });

    // Empty state click delegation (Clear filters or Add button)
    this.amenitiesContainer?.addEventListener('click', e => {
      if (e.target.id === 'btn-clear-filters') {
        this.handleClearFilters();
      } else if (e.target.id === 'btn-empty-add') {
        this.openAddModal();
      }
    });

    // 5. Add Amenity CTA Button
    this.btnOpenAddModal?.addEventListener('click', () => {
      this.openAddModal();
    });

    // 6. Reset Sample Data CTA
    this.btnResetData?.addEventListener('click', () => {
      this.handleResetData();
    });

    // 7. Amenity Form Submission
    this.amenityForm?.addEventListener('submit', e => {
      e.preventDefault();
      this.handleAmenityFormSubmit();
    });

    // 8. Delete Confirmation Action
    this.btnConfirmDelete?.addEventListener('click', () => {
      this.handleConfirmDelete();
    });

    // 9. Generic Modal Close Buttons & Backdrop Click
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    [this.amenityModal, this.deleteModal, this.viewModal].forEach(modal => {
      modal?.addEventListener('click', e => {
        if (e.target === modal) {
          this.closeAllModals();
        }
      });
    });

    // 10. Global Keyboard Handling (Escape & Tab Focus Trap)
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.activeModal) {
        e.preventDefault();
        this.closeAllModals();
      }

      if (e.key === 'Tab' && this.activeModal) {
        this.handleFocusTrap(e);
      }
    });
  }

  /**
   * Renders the complete dashboard view.
   */
  render() {
    renderMetrics(this.state.getMetrics());
    this.renderAmenities();
  }

  /**
   * Renders amenities list or empty state based on filtered records.
   */
  renderAmenities() {
    const filtered = this.state.getFilteredAmenities();
    const totalCount = this.state.amenities.length;

    // Update results count indicator
    if (this.resultsCountEl) {
      if (filtered.length === totalCount) {
        this.resultsCountEl.textContent = `Showing all ${totalCount} amenities`;
      } else {
        this.resultsCountEl.textContent = `Showing ${filtered.length} of ${totalCount} amenities`;
      }
    }

    if (filtered.length > 0) {
      renderAmenitiesTable(this.amenitiesContainer, filtered);
    } else {
      if (totalCount === 0) {
        renderEmptyState(this.amenitiesContainer, {
          title: 'No Amenity Records In Registry',
          message: 'The boutique hotel amenities register is currently empty. Add your first amenity record or restore sample data.',
          showAddButton: true,
          showResetButton: true
        });
      } else {
        renderEmptyState(this.amenitiesContainer, {
          title: 'No Matching Amenities Found',
          message: 'No operational amenities match the specified search keywords or filter criteria.',
          showResetButton: true
        });
      }
    }
  }

  /**
   * Synchronizes active class in sidebar navigation.
   * @param {string} category
   */
  syncSidebarActiveState(category) {
    if (!this.sidebarNav) return;
    const items = this.sidebarNav.querySelectorAll('.nav-item');
    items.forEach(item => {
      const itemCat = item.dataset.category || 'all';
      if (itemCat === category) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Resets all search queries and filters to baseline.
   */
  handleClearFilters() {
    this.state.clearFilters();
    if (this.searchInput) this.searchInput.value = '';
    if (this.searchClearBtn) this.searchClearBtn.classList.add('hidden');
    if (this.categorySelect) this.categorySelect.value = 'all';
    if (this.statusSelect) this.statusSelect.value = 'all';
    if (this.sortSelect) this.sortSelect.value = 'name-asc';

    this.syncSidebarActiveState('all');
    this.renderAmenities();
    announceToScreenReader('All filters cleared. Displaying all registered amenities.');
    this.showToast('Filters cleared', 'info');
  }

  /**
   * Opens Add Amenity Modal.
   */
  openAddModal() {
    this.lastFocusedElement = document.activeElement;
    this.editingAmenityId = null;

    if (this.modalTitle) {
      this.modalTitle.textContent = 'Add New Boutique Amenity';
    }

    if (this.amenityForm) {
      this.amenityForm.reset();
      clearFieldErrors(this.amenityForm);
      if (this.amenityForm.status) {
        this.amenityForm.status.value = 'Available';
      }
    }

    this.openModal(this.amenityModal);
    setTimeout(() => {
      document.getElementById('amenity-name')?.focus();
    }, 100);
  }

  /**
   * Opens Edit Amenity Modal.
   * @param {string} id
   */
  openEditModal(id) {
    const item = this.state.getAmenityById(id);
    if (!item) return;

    this.lastFocusedElement = document.activeElement;
    this.editingAmenityId = id;

    if (this.modalTitle) {
      this.modalTitle.textContent = `Edit Amenity: ${item.name}`;
    }

    if (this.amenityForm) {
      clearFieldErrors(this.amenityForm);
      this.amenityForm.name.value = item.name;
      this.amenityForm.category.value = item.category;
      this.amenityForm.location.value = item.location;
      this.amenityForm.description.value = item.description;
      this.amenityForm.hours.value = item.hours;
      this.amenityForm.status.value = item.status;
    }

    this.openModal(this.amenityModal);
    setTimeout(() => {
      document.getElementById('amenity-name')?.focus();
    }, 100);
  }

  /**
   * Opens View Details Modal.
   * @param {string} id
   */
  openViewModal(id) {
    const item = this.state.getAmenityById(id);
    if (!item) return;

    this.lastFocusedElement = document.activeElement;

    if (this.viewDetailsContainer) {
      this.viewDetailsContainer.innerHTML = '';

      const content = document.createElement('div');
      content.className = 'view-details-grid';

      const createDetailRow = (label, value, isBadge = false) => {
        const row = document.createElement('div');
        row.className = 'detail-row';

        const dt = document.createElement('span');
        dt.className = 'detail-label';
        dt.textContent = label;

        const dd = document.createElement('span');
        dd.className = 'detail-value';

        if (isBadge) {
          const badge = document.createElement('span');
          badge.className = `status-badge status-${(value || '').toLowerCase()}`;
          badge.textContent = value;
          dd.appendChild(badge);
        } else {
          dd.textContent = value;
        }

        row.appendChild(dt);
        row.appendChild(dd);
        return row;
      };

      content.appendChild(createDetailRow('Amenity Name', item.name));
      content.appendChild(createDetailRow('Category', item.category));
      content.appendChild(createDetailRow('Location', item.location));
      content.appendChild(createDetailRow('Operating Hours', item.hours));
      content.appendChild(createDetailRow('Availability Status', item.status, true));
      content.appendChild(createDetailRow('Description', item.description));
      content.appendChild(createDetailRow('Last Updated', formatTimestamp(item.updatedAt)));

      this.viewDetailsContainer.appendChild(content);
    }

    this.openModal(this.viewModal);
  }

  /**
   * Opens Delete Confirmation Modal.
   * @param {string} id
   */
  openDeleteModal(id) {
    const item = this.state.getAmenityById(id);
    if (!item) return;

    this.lastFocusedElement = document.activeElement;
    this.pendingDeleteId = id;

    if (this.deleteAmenityNameEl) {
      this.deleteAmenityNameEl.textContent = `"${item.name}" (${item.location})`;
    }

    this.openModal(this.deleteModal);
    setTimeout(() => {
      this.btnConfirmDelete?.focus();
    }, 100);
  }

  /**
   * Handles Amenity Form Submission (Add or Edit).
   */
  handleAmenityFormSubmit() {
    clearFieldErrors(this.amenityForm);
    const errors = validateAmenityForm(this.amenityForm);

    if (Object.keys(errors).length > 0) {
      // Highlight errors with accessible indicators
      Object.entries(errors).forEach(([field, message]) => {
        const input = this.amenityForm[field];
        const errorSpan = document.getElementById(`${field}-error`);
        setFieldError(input, message, errorSpan);
      });

      // Focus first erroneous field
      const firstErrorField = Object.keys(errors)[0];
      this.amenityForm[firstErrorField]?.focus();
      announceToScreenReader('Form submission has errors. Please correct the highlighted fields.');
      return;
    }

    // Sanitize input
    const rawData = {
      name: this.amenityForm.name.value,
      category: this.amenityForm.category.value,
      location: this.amenityForm.location.value,
      description: this.amenityForm.description.value,
      hours: this.amenityForm.hours.value,
      status: this.amenityForm.status.value
    };

    const cleanData = sanitizeAmenityInput(rawData);

    this.showLoading(true);

    setTimeout(() => {
      try {
        if (this.editingAmenityId) {
          // Edit existing
          const updated = this.state.updateAmenity(this.editingAmenityId, cleanData);
          saveAmenities(this.state.amenities);
          this.render();
          this.closeAllModals();
          this.showToast(`Updated "${updated.name}" successfully`, 'success');
          announceToScreenReader(`Amenity ${updated.name} updated successfully.`);
        } else {
          // Add new
          const created = this.state.addAmenity(cleanData);
          saveAmenities(this.state.amenities);
          this.render();
          this.closeAllModals();
          this.showToast(`Added "${created.name}" to registry`, 'success');
          announceToScreenReader(`New amenity ${created.name} registered.`);
        }
      } catch (err) {
        // Handle duplicate record or other state errors
        const nameInput = this.amenityForm.name;
        const nameError = document.getElementById('name-error');
        setFieldError(nameInput, err.message, nameError);
        nameInput?.focus();
        announceToScreenReader(`Validation error: ${err.message}`);
      } finally {
        this.showLoading(false);
      }
    }, 200);
  }

  /**
   * Confirms deletion of an amenity record.
   */
  handleConfirmDelete() {
    if (!this.pendingDeleteId) return;

    const item = this.state.getAmenityById(this.pendingDeleteId);
    const itemName = item ? item.name : 'Amenity';

    this.showLoading(true);

    setTimeout(() => {
      this.state.deleteAmenity(this.pendingDeleteId);
      saveAmenities(this.state.amenities);
      this.pendingDeleteId = null;

      this.render();
      this.closeAllModals();
      this.showToast(`Deleted "${itemName}" from registry`, 'info');
      announceToScreenReader(`Amenity ${itemName} removed.`);
      this.showLoading(false);
    }, 200);
  }

  /**
   * Fast status toggle directly from the list.
   * @param {string} id
   * @param {string} newStatus
   */
  handleQuickStatusChange(id, newStatus) {
    const updated = this.state.updateAmenity(id, { status: newStatus });
    if (updated) {
      saveAmenities(this.state.amenities);
      renderMetrics(this.state.getMetrics());
      this.renderAmenities();
      this.showToast(`Status of "${updated.name}" set to ${newStatus}`, 'success');
      announceToScreenReader(`Availability for ${updated.name} updated to ${newStatus}`);
    }
  }

  /**
   * Resets local data back to initial hotel sample records.
   */
  handleResetData() {
    const confirmed = window.confirm(
      'Reset all amenity records to initial sample records? Any custom additions or edits stored locally on this device will be reset.'
    );

    if (!confirmed) return;

    this.showLoading(true);

    setTimeout(() => {
      const resetList = resetAmenitiesToDefault();
      this.state = new AppState(resetList);
      this.render();
      this.showToast('Reset to initial sample records', 'info');
      announceToScreenReader('Amenity database reset to default sample records.');
      this.showLoading(false);
    }, 300);
  }

  /**
   * Opens modal and establishes focus trap.
   * @param {HTMLElement} modal
   */
  openModal(modal) {
    if (!modal) return;
    this.activeModal = modal;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  /**
   * Closes all active modals and restores focus.
   */
  closeAllModals() {
    if (!this.activeModal) return;

    this.activeModal.classList.add('hidden');
    this.activeModal.setAttribute('aria-hidden', 'true');
    this.activeModal = null;
    this.pendingDeleteId = null;
    this.editingAmenityId = null;
    document.body.classList.remove('modal-open');

    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
    }
  }

  /**
   * Accessible focus trap inside modal dialog.
   * @param {KeyboardEvent} e
   */
  handleFocusTrap(e) {
    const focusable = this.activeModal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  /**
   * Controls mobile navigation drawer.
   */
  toggleMobileNav() {
    const isOpen = this.sidebarNav?.classList.contains('mobile-open');
    if (isOpen) {
      this.closeMobileNav();
    } else {
      this.openMobileNav();
    }
  }

  openMobileNav() {
    this.sidebarNav?.classList.add('mobile-open');
    this.mobileNavBackdrop?.classList.remove('hidden');
    this.mobileNavToggle?.setAttribute('aria-expanded', 'true');
  }

  closeMobileNav() {
    this.sidebarNav?.classList.remove('mobile-open');
    this.mobileNavBackdrop?.classList.add('hidden');
    this.mobileNavToggle?.setAttribute('aria-expanded', 'false');
  }

  /**
   * Shows or hides the loading overlay.
   * @param {boolean} show
   */
  showLoading(show) {
    if (this.loadingOverlay) {
      this.loadingOverlay.classList.toggle('hidden', !show);
      this.loadingOverlay.setAttribute('aria-busy', show ? 'true' : 'false');
    }
  }

  /**
   * Displays an elegant transient toast notification.
   * @param {string} message
   * @param {'success'|'info'|'warning'|'danger'} type
   */
  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'status');

    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }
}

// Instantiate and initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
