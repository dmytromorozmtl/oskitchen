import { describe, expect, it } from 'vitest';

import {
  FULL_SERVICE_FEATURE_HIGHLIGHTS,
  FULL_SERVICE_RESTAURANT_PATH,
  getFullServiceRestaurantContent,
} from '@/lib/marketing/full-service-restaurant-landing-content';

describe('full-service restaurant landing content', () => {
  it('exposes public landing path and hero content', () => {
    expect(FULL_SERVICE_RESTAURANT_PATH).toBe('/landing/full-service-restaurant');
    const content = getFullServiceRestaurantContent();
    expect(content.badge).toContain('full-service');
    expect(content.features.length).toBeGreaterThanOrEqual(4);
  });

  it('highlights table mgmt, QR, KDS, and bill splitting', () => {
    const titles = FULL_SERVICE_FEATURE_HIGHLIGHTS.map((f) => f.title);
    expect(titles).toContain('Table management');
    expect(titles).toContain('QR table ordering');
    expect(titles).toContain('Kitchen Display System');
    expect(titles).toContain('Bill splitting');
  });
});
