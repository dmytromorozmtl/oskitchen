import { describe, expect, it } from 'vitest';

import {
  NO_LOCK_IN_BADGE_LABEL,
  NO_LOCK_IN_HERO_SUBHEADING,
} from '@/components/marketing/no-lock-in-badge';
import { scanMarketingText } from '@/lib/governance/marketing-claims-governance-policy';

describe('no-lock-in-badge marketing copy', () => {
  it('exports expected badge and hero labels', () => {
    expect(NO_LOCK_IN_BADGE_LABEL).toBe('No Hardware Lock-In');
    expect(NO_LOCK_IN_HERO_SUBHEADING).toBe('Works with your equipment');
  });

  it('passes marketing claims governance scan', () => {
    const copy = [
      NO_LOCK_IN_BADGE_LABEL,
      NO_LOCK_IN_HERO_SUBHEADING,
      'Bring your tablet, printer, and optional card reader — no proprietary terminal contract.',
    ].join(' ');

    expect(scanMarketingText(copy, 'no-lock-in-badge')).toHaveLength(0);
  });
});
