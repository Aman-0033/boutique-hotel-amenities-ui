/**
 * Initial Sample Data for Boutique Hotel Amenities
 * Boutique Hotel Amenities UI - Ticket ENG-19777
 *
 * Provides realistic operational records for floor staff and managers.
 */

export const HOTEL_CATEGORIES = [
  'Wellness & Spa',
  'Dining & Lounge',
  'Services & Experiences',
  'In-Room Comfort',
  'Recreation'
];

export const HOTEL_STATUSES = [
  'Available',
  'Limited',
  'Unavailable'
];

export const INITIAL_AMENITIES = [
  {
    id: 'amenity-001',
    name: 'Rooftop Hydrotherapy Infinity Pool',
    category: 'Wellness & Spa',
    location: '18th Floor Terrace & Sky Deck',
    description: 'Temperature-regulated saltwater heated pool with panoramic skyline vistas, private cabanas, and sunbed concierge service.',
    hours: '06:00 - 22:00',
    status: 'Available',
    createdAt: '2026-11-10T08:00:00.000Z',
    updatedAt: '2026-11-18T09:30:00.000Z'
  },
  {
    id: 'amenity-002',
    name: 'Nordic Cedarwood Sauna & Steam Sanctuary',
    category: 'Wellness & Spa',
    location: 'Sub-Level B1 Wellness Pavilion',
    description: 'Authentic Finnish pine sauna, botanical eucalyptus steam room, Himalayan salt inhalation grotto, and ice plunge baths.',
    hours: '07:00 - 21:00',
    status: 'Limited',
    createdAt: '2026-11-11T08:00:00.000Z',
    updatedAt: '2026-11-18T14:15:00.000Z'
  },
  {
    id: 'amenity-003',
    name: 'Sommelier Private Cellar & Tasting Salon',
    category: 'Dining & Lounge',
    location: 'Ground Floor Cellar Vault',
    description: 'Temperature-controlled reserve room housing over 1,800 biodynamic and grand cru bottles with bespoke evening tastings.',
    hours: '17:00 - 23:30',
    status: 'Available',
    createdAt: '2026-11-12T08:00:00.000Z',
    updatedAt: '2026-11-17T18:00:00.000Z'
  },
  {
    id: 'amenity-004',
    name: 'The Obsidian Rooftop Cocktail Lounge',
    category: 'Dining & Lounge',
    location: '19th Floor Penthouse Lounge',
    description: 'Craft cocktail lounge featuring small-batch artisanal spirits, seasonal aperitifs, and live jazz quartet performances.',
    hours: '16:00 - 02:00',
    status: 'Available',
    createdAt: '2026-11-12T08:00:00.000Z',
    updatedAt: '2026-11-18T16:45:00.000Z'
  },
  {
    id: 'amenity-005',
    name: 'Les Clefs d’Or Concierge Desk',
    category: 'Services & Experiences',
    location: 'Grand Lobby South Gallery',
    description: '24-hour accredited concierge providing private museum viewings, bespoke city excursions, and VIP table access.',
    hours: '24/7',
    status: 'Available',
    createdAt: '2026-11-09T08:00:00.000Z',
    updatedAt: '2026-11-18T08:00:00.000Z'
  },
  {
    id: 'amenity-006',
    name: 'Private Chauffeur Airport Limousine Fleet',
    category: 'Services & Experiences',
    location: 'Porte-Cochère & VIP Motor Court',
    description: 'Mercedes-Maybach and electric luxury sedans with personal driver for seamless airport transfers and executive hire.',
    hours: '24/7 (Advance Reservation)',
    status: 'Limited',
    createdAt: '2026-11-10T08:00:00.000Z',
    updatedAt: '2026-11-18T11:20:00.000Z'
  },
  {
    id: 'amenity-007',
    name: 'Audiophile Vinyl Listening Library',
    category: 'In-Room Comfort',
    location: 'Executive Suites & Library Salon',
    description: 'Pro-Ject turntable setups, master headphone collection, and an expansive curated vinyl catalog across jazz, classical, and ambient.',
    hours: '24/7',
    status: 'Available',
    createdAt: '2026-11-13T08:00:00.000Z',
    updatedAt: '2026-11-17T15:00:00.000Z'
  },
  {
    id: 'amenity-008',
    name: 'Artisanal Pillow Menu & Sleep Aromatherapy',
    category: 'In-Room Comfort',
    location: 'All Guest Suites (Upon Request)',
    description: 'Choice of goose down, buckwheat, memory gel, or organic lavender pillows paired with therapeutic nighttime mist diffusion.',
    hours: '24/7 Floor Service',
    status: 'Available',
    createdAt: '2026-11-10T08:00:00.000Z',
    updatedAt: '2026-11-18T13:00:00.000Z'
  },
  {
    id: 'amenity-009',
    name: 'Technogym Sky Fitness Pavilion',
    category: 'Recreation',
    location: '17th Floor West Wing',
    description: 'State-of-the-art biomechanical cardio and strength training equipment, private stretching studio, and personal trainer booking.',
    hours: '05:00 - 23:00',
    status: 'Available',
    createdAt: '2026-11-11T08:00:00.000Z',
    updatedAt: '2026-11-18T07:30:00.000Z'
  },
  {
    id: 'amenity-010',
    name: 'Private Squash & Racquet Court',
    category: 'Recreation',
    location: 'Sub-Level B2 Athletic Facility',
    description: 'Championship-grade indoor squash court with professional equipment, spectator gallery, and seasonal coaching clinics.',
    hours: '08:00 - 20:00',
    status: 'Unavailable',
    createdAt: '2026-11-14T08:00:00.000Z',
    updatedAt: '2026-11-18T17:10:00.000Z'
  }
];
