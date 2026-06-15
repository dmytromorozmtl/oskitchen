import { describe, expect, it } from 'vitest';

import {
  COFFEE_SHOP_FEATURE_HIGHLIGHTS,
  COFFEE_SHOP_LANDING_PATH,
  getCoffeeShopLandingContent,
} from '@/lib/marketing/coffee-shop-landing-content';

describe('coffee shop landing content', () => {
  it('exposes public landing path and cafe hero content', () => {
    expect(COFFEE_SHOP_LANDING_PATH).toBe('/landing/coffee-shop');
    const content = getCoffeeShopLandingContent();
    expect(content.badge).toContain('caf');
    expect(content.features.length).toBeGreaterThanOrEqual(4);
  });

  it('highlights speed mode, production calendar, loyalty, and QR ordering', () => {
    const titles = COFFEE_SHOP_FEATURE_HIGHLIGHTS.map((f) => f.title);
    expect(titles).toContain('Speed mode POS');
    expect(titles).toContain('Production calendar');
    expect(titles).toContain('10th coffee free loyalty');
    expect(titles).toContain('QR pickup ordering');
  });
});
