import { describe, expect, it } from 'vitest';

import {
  BAR_FEATURE_HIGHLIGHTS,
  BAR_LANDING_PATH,
  getBarLandingContent,
} from '@/lib/marketing/bar-landing-content';

describe('bar landing content', () => {
  it('exposes public landing path and bar hero content', () => {
    expect(BAR_LANDING_PATH).toBe('/landing/bar');
    const content = getBarLandingContent();
    expect(content.badge.toLowerCase()).toContain('bar');
    expect(content.features.length).toBeGreaterThanOrEqual(4);
  });

  it('highlights tabs, speed mode, pour inventory, voice, and dark mode', () => {
    const titles = BAR_FEATURE_HIGHLIGHTS.map((f) => f.title);
    expect(titles).toContain('Tab management');
    expect(titles).toContain('Speed mode POS');
    expect(titles).toContain('Inventory per pour');
    expect(titles).toContain('Voice ordering');
    expect(titles).toContain('Dark mode UI');
  });
});
