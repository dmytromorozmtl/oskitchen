import { describe, expect, it } from 'vitest';

import {
  GHOST_KITCHEN_FEATURE_HIGHLIGHTS,
  GHOST_KITCHEN_LANDING_PATH,
  getGhostKitchenLandingContent,
} from '@/lib/marketing/ghost-kitchen-landing-content';

describe('ghost kitchen landing content', () => {
  it('exposes public landing path and multi-brand hero content', () => {
    expect(GHOST_KITCHEN_LANDING_PATH).toBe('/landing/ghost-kitchen');
    const content = getGhostKitchenLandingContent();
    expect(content.h1.toLowerCase()).toContain('ghost');
    expect(content.features.length).toBeGreaterThanOrEqual(4);
  });

  it('highlights order hub, marketplace, AI purchasing, production, and brand P&L', () => {
    const titles = GHOST_KITCHEN_FEATURE_HIGHLIGHTS.map((f) => f.title);
    expect(titles).toContain('Unified Order Hub');
    expect(titles).toContain('HoReCa marketplace');
    expect(titles).toContain('AI Purchasing');
    expect(titles).toContain('Production board');
    expect(titles).toContain('Profit per brand');
  });
});
