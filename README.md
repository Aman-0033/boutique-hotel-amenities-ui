# Boutique Hotel Amenities UI

**Ticket:** ENG-19777  
**Epic:** Core Infrastructure Overhaul  
**Priority:** P1  
**Target Users:** Hotel Floor Staff, Concierge, and Operations Managers  

---

## 1. Project Overview

The Boutique Hotel Amenities UI is an internal, staff-facing operational dashboard designed for boutique luxury hospitality properties (e.g., *L’Étoile Residence*). It replaces traditional paper logs and ad-hoc spreadsheets with a modern, high-efficiency digital register for tracking, searching, and managing hotel amenities, operational hours, guest access locations, and real-time availability status.

The visual style adheres to a **monochromatic corporate luxury design system** with editorial typography, refined borders, accessible contrast ratios, and responsive layouts tailored for desktop workstations, tablets, and mobile floor devices.

---

## 2. Main Features

- **Dynamic Overview Metrics:** Real-time counters showing *Total Amenities*, *Available Now*, *Limited Access*, and *Unavailable* status, calculated dynamically from active records.
- **High-Density Operational Table (Desktop):** Structured data table displaying Amenity Name & Location, Category Pill, Operating Hours, Availability Badge, Last Updated date, and Staff Actions.
- **Responsive Card View (Mobile/Tablet):** Automatically switches from a data table to high-touch, structured cards on screens under 860px width.
- **Search & Multi-Facet Filtering:**
  - Debounced live search across name, location, department, and description.
  - Keyboard shortcut: Press `/` anywhere to jump focus to the search bar.
  - Department filtering (*Wellness & Spa*, *Dining & Lounge*, *Services & Experiences*, *In-Room Comfort*, *Recreation*).
  - Availability status filtering (*Available*, *Limited*, *Unavailable*).
  - Sorting options (Name A-Z, Name Z-A, Status, Recently Updated).
  - Quick "Clear Filters" action with results count indicator.
- **Full Amenity Lifecycle Management (CRUD):**
  - **Add Amenity:** Modal form with accessible real-time validation, duplicate detection, and input sanitization.
  - **View Details:** Modal displaying full operational notes, location, hours, and timestamps.
  - **Edit Amenity:** Modal allowing editing of all metadata.
  - **Delete Amenity:** Safety confirmation dialog showing target amenity name.
  - **Inline Quick Status Toggle:** Dropdown in the table for staff to quickly update availability without opening a modal.
- **Offline & Connectivity Resilience:**
  - Real-time `online`/`offline` network status listeners.
  - Visual status pill in top navigation header (*Operational (Online)* vs. *Device Offline (Local Mode)*).
  - Accessible banner notifying staff when working offline that changes remain safe on the terminal.
- **Security & XSS Protection:**
  - Custom sanitization stripping control characters, script/style tags, and dangerous markup.
  - Safe DOM insertion via `textContent`—no untrusted HTML rendering.
- **Enterprise Analytics Simulation:**
  - Automated logging on primary interactions:
    `console.log("[Analytics] User interacted with Boutique Hotel Amenities UI");`
- **100% Lighthouse Accessibility:**
  - Semantic HTML5 elements (`<header>`, `<nav>`, `<aside>`, `<main>`, `<section>`, `<table>`, `<dialog>`).
  - Strict sequential heading hierarchy (`h1` -> `h2` -> `h3`).
  - Screen reader announcements via `aria-live="polite"` live regions.
  - Full keyboard navigation with modal focus trapping and focus restoration on dismiss (`Escape` key support).
  - WCAG AAA conforming contrast ratios.
  - `@media (prefers-reduced-motion: reduce)` support.

---

## 3. Technology Stack

- **Markup:** Semantic HTML5
- **Styling:** Pure Vanilla CSS (CSS Custom Properties, Flexbox, CSS Grid, zero CSS frameworks)
- **Scripting:** Pure Vanilla JavaScript (ES2024 Modules, zero frontend frameworks)
- **Local Dev Server:** Vite 6 (vanilla JS mode)
- **Test Runner:** Vitest 3 + JSDOM
- **Linter:** ESLint 9 (Flat Config)
- **Auditing:** Google Lighthouse CLI 12

> **Strict Compliance Note:** No React, Next.js, Tailwind CSS, Bootstrap, or external UI component libraries are used in the application.

---

## 4. Project Folder Structure

```
boutique-hotel-amenities-ui/
├── dist/                          # Production build output (pure HTML, CSS, JS)
│   ├── assets/
│   │   ├── index-[hash].css
│   │   └── index-[hash].js
│   └── index.html
├── src/
│   ├── css/
│   │   └── style.css              # Monochromatic luxury design system stylesheet
│   └── js/
│       ├── analytics.js           # Interaction analytics simulation
│       ├── app.js                 # Controller, modal management, event listeners
│       ├── data.js                # Initial sample boutique hotel amenities data
│       ├── sanitize.js            # Input sanitization and XSS prevention
│       ├── state.js               # Domain model, search/filter algorithms, CRUD
│       ├── storage.js             # LocalStorage persistence & error handling
│       └── ui.js                  # Accessible DOM rendering & validation helpers
├── tests/
│   ├── analytics.test.js          # Analytics logging tests
│   ├── app.test.js                # End-to-end integration workflow tests
│   ├── sanitize.test.js           # Security and XSS prevention tests
│   ├── state.test.js              # State management & dynamic metrics tests
│   ├── storage.test.js            # LocalStorage & corrupted JSON tests
│   └── ui.test.js                 # DOM rendering & form validation tests
├── .gitignore
├── eslint.config.js               # ESLint 9 configuration
├── index.html                     # Semantic HTML5 application entry point
├── package.json                   # Project metadata and development scripts
├── PROMPTS.md                     # Chronological engineering prompt history
├── README.md                      # Comprehensive project documentation
└── vitest.config.js               # Vitest + JSDOM test runner configuration
```

---

## 5. Installation Instructions

1. Ensure **Node.js** (v18 or higher) and **npm** are installed.
2. Clone or open the project directory:
   ```bash
   cd "d:\My Company work\Project 7"
   ```
3. Install development dependencies:
   ```bash
   npm install
   ```

---

## 6. Development Server Instructions

To launch the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will be accessible at:
```
http://localhost:5173/
```

To create and preview the production build:
```bash
npm run build
npm run preview
```

---

## 7. Testing & Quality Verification

### Run the Vitest Test Suite
Execute all 38 automated unit and integration tests:
```bash
npm test
```

### Run ESLint Code Quality Verification
Verify code formatting, unused variables, and syntax standards (0 warnings expected):
```bash
npm run lint
```

### Run Lighthouse Accessibility & Performance Audit
```bash
npx lighthouse http://localhost:5173/ --chrome-flags="--headless --no-sandbox" --output=json --output-path=./lighthouse-report.json --only-categories=accessibility,best-practices,performance,seo
```

---

## 8. Explanation of Frontend-Only Storage

This project operates in **frontend-only mode** using the browser's `localStorage` API (`key: boutique_hotel_amenities_v1`).

- **Persistence Scope:** Any amenity added, edited, or deleted is saved strictly to the local browser profile on the current terminal/device.
- **Initial Dataset:** If no stored data exists, the application automatically seeds an initial register of 10 curated boutique hotel amenities.
- **Corrupted Storage Recovery:** If stored JSON is malformed or invalid, the storage module catches the error, logs a warning, and safely restores the initial sample data without crashing.
- **Demo Data Reset:** A "Reset Demo" button in the top navigation allows floor staff to restore the pristine sample dataset at any time.

---

## 9. Known Limitations & Backend Integration Requirements

1. **No Cross-Device Synchronization:**
   - Because there is no backend API or WebSocket server, updates made on one staff member's tablet will not reflect on another terminal.
   - *Production Solution:* Connect an authenticated REST/GraphQL API or WebSocket broker (e.g., Node.js / PostgreSQL / Redis) to broadcast availability changes in real time across hotel departments.
2. **Device-Bound Audit History:**
   - Operational changes and timestamps are recorded in local state rather than an immutable central database audit log.
   - *Production Solution:* Integrate a centralized operational logging backend with role-based access control (RBAC).
3. **No Direct Room PMS Integration:**
   - The interface is currently a standalone operational portal and is not wired to a Property Management System (PMS) like Opera or Mews.
