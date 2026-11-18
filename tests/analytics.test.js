import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackUserInteraction, ACTION_TYPES } from '../src/js/analytics.js';

describe('Analytics Simulation Module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the exact specified analytics message on user action', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    trackUserInteraction(ACTION_TYPES.ADD_AMENITY, { amenityId: 'amenity-101' });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Analytics] User interacted with Boutique Hotel Amenities UI'
    );
  });

  it('tracks primary actions: add, edit, delete, update availability', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    trackUserInteraction(ACTION_TYPES.ADD_AMENITY);
    trackUserInteraction(ACTION_TYPES.EDIT_AMENITY);
    trackUserInteraction(ACTION_TYPES.DELETE_AMENITY);
    trackUserInteraction(ACTION_TYPES.UPDATE_STATUS);

    expect(consoleSpy).toHaveBeenCalledTimes(4);
    for (let i = 0; i < 4; i++) {
      expect(consoleSpy).toHaveBeenNthCalledWith(
        i + 1,
        '[Analytics] User interacted with Boutique Hotel Amenities UI'
      );
    }
  });

  it('does not log personal or sensitive information', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    trackUserInteraction(ACTION_TYPES.ADD_AMENITY, {
      staffEmail: 'staff@boutiquehotel.com',
      guestName: 'VIP Guest'
    });

    const loggedArgs = consoleSpy.mock.calls.flat();
    loggedArgs.forEach(arg => {
      expect(String(arg)).not.toContain('staff@boutiquehotel.com');
      expect(String(arg)).not.toContain('VIP Guest');
    });
  });
});
