import { describe, expect, it } from 'vitest';

import {
  FAST_PAYOUTS_BADGE_DETAIL,
  FAST_PAYOUTS_BADGE_LABEL,
} from '@/components/marketing/fast-payouts-badge';
import { scanMarketingText } from '@/lib/governance/marketing-claims-governance-policy';

describe('fast-payouts-badge marketing copy', () => {
  it('exports expected badge labels', () => {
    expect(FAST_PAYOUTS_BADGE_LABEL).toBe('Next-Day Payouts');
    expect(FAST_PAYOUTS_BADGE_DETAIL).toContain('Stripe standard schedule');
  });

  it('passes marketing claims governance scan', () => {
    const copy = [FAST_PAYOUTS_BADGE_LABEL, FAST_PAYOUTS_BADGE_DETAIL].join(' ');
    expect(scanMarketingText(copy, 'fast-payouts-badge')).toHaveLength(0);
  });
});
