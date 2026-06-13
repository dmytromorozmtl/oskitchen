/**
 * Blueprint P3-67 — reusable social proof section for marketing landings.
 *
 * Honest placeholders only — no fabricated customer counts or verified quotes.
 */

export const SOCIAL_PROOF_SECTION_TEST_ID = 'social-proof-section' as const;

export const SOCIAL_PROOF_SECTION_TAG = 'Operator proof' as const;

export const SOCIAL_PROOF_SECTION_DISCLAIMER =
  'Stats and quotes are illustrative until design partner case studies publish — see /trust for module maturity labels.' as const;

export type SocialProofTestimonial = {
  quote: string;
  name: string;
  role: string;
  disclaimer: string;
};

export type SocialProofStat = {
  value: string;
  label: string;
  caveat?: string;
};

export const SOCIAL_PROOF_DEFAULT_STATS: readonly SocialProofStat[] = [
  {
    value: 'Design partner',
    label: 'Cohort open',
    caveat: '0 signed founding customers — honest count',
  },
  {
    value: '18',
    label: 'Integration adapters',
    caveat: 'PASS / SKIPPED per workspace',
  },
  {
    value: '14-day',
    label: 'Free trial',
    caveat: 'No credit card required',
  },
] as const;

export const SOCIAL_PROOF_SEGMENT_LABELS = [
  'commissary operators',
  'ghost kitchen operators',
  'meal prep operators',
  'Shopify + kitchen operators',
  'multi-channel operators',
  'delivery-heavy operators',
] as const;

export const SOCIAL_PROOF_REQUIRED_MARKERS = [
  SOCIAL_PROOF_SECTION_TEST_ID,
  'Illustrative placeholder',
  'not a verified customer quote',
] as const;

export function socialProofSectionTitle(segmentLabel: string): string {
  return `Why ${segmentLabel} evaluate OS Kitchen`;
}
