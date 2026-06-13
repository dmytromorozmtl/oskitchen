import {
  COMMISSION_COMPARISON_CALCULATOR_PATH,
  COMMISSION_COMPARISON_CALCULATOR_META,
} from '@/lib/marketing/commission-comparison-calculator-content';
import {
  COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT,
  COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT,
} from '@/lib/marketing/commission-comparison-calculator-p2-46-policy';

export const COMMISSION_COMPARISON_LANDING_PATH = COMMISSION_COMPARISON_CALCULATOR_PATH;

export const COMMISSION_COMPARISON_LANDING_META = {
  ...COMMISSION_COMPARISON_CALCULATOR_META,
  keywords: [
    'commission comparison calculator',
    'doordash commission calculator',
    'marketplace vs own channel',
    'restaurant delivery commission',
    'chownow alternative commission',
  ],
  utmCampaign: 'commission_comparison_seo',
} as const;

export const COMMISSION_COMPARISON_LANDING_BADGE =
  'ChowNow parity · interactive commission calculator' as const;

export const COMMISSION_COMPARISON_LANDING_H1 =
  'Commission Comparison Calculator — DoorDash 30% vs Owned 0%' as const;

export const COMMISSION_COMPARISON_LANDING_SUBTITLE =
  `Model marketplace delivery fees against an owned storefront with ${COMMISSION_COMPARISON_CALCULATOR_P2_46_OWNED_MARKETPLACE_PCT}% platform commission. DoorDash benchmark at ${COMMISSION_COMPARISON_CALCULATOR_P2_46_DOORDASH_BENCHMARK_PCT}% — directional only, not a settlement guarantee.` as const;

export const COMMISSION_COMPARISON_LANDING_PAIN_POINTS = [
  {
    title: '30% marketplace tax on every ticket',
    description:
      'DoorDash and Uber Eats take a quarter to a third of gross — operators rarely model annual drag until finance asks.',
  },
  {
    title: 'Spreadsheets hide channel mix',
    description:
      'Without per-channel commission math, owned-channel investment looks expensive when it is often cheaper at scale.',
  },
  {
    title: 'Sales pitches skip settlement reality',
    description:
      'Competitors promise "0% commission" without separating marketplace fees from payment processing — reconcile both.',
  },
] as const;

export const COMMISSION_COMPARISON_LANDING_LIMITATIONS = [
  'Benchmark rates are directional — reconcile every channel against your marketplace settlement statement.',
  'Owned channel models 0% marketplace commission plus payment processing — not OS Kitchen subscription fees.',
  'DoorDash 30% is an industry benchmark illustration — your contracted rate may differ by market and tier.',
  'Annual savings assume constant volume — seasonality and mix shifts are not projected.',
  'Uber Eats, Grubhub, and Uber Direct rates use the same benchmark source as the delivery-commissions dashboard — verify LIVE status in pilot.',
] as const;

export const COMMISSION_COMPARISON_LANDING_FAQ = [
  {
    question: 'Is DoorDash really 30% commission?',
    answer:
      'Rates vary by market, tier, and promotion — 30% is a common benchmark for illustration. Use your settlement statement for actual math; this calculator is directional only.',
  },
  {
    question: 'What does owned 0% mean?',
    answer:
      'OS Kitchen owned storefront charges 0% marketplace platform commission — you pay payment processing (~2.9% typical) plus your OS Kitchen subscription, not aggregator take rates.',
  },
  {
    question: 'How is this different from the dashboard calculator?',
    answer:
      'This public page is for prospects modeling commission drag. After signup, track live commissions at /dashboard/analytics/delivery-commissions and run campaigns at /dashboard/marketing/commission-free-ordering.',
  },
  {
    question: 'Can I compare multiple marketplaces?',
    answer:
      'Yes — the full calculator below models DoorDash, Uber Eats, Grubhub, and Uber Direct mix with normalized channel percentages.',
  },
] as const;

export const COMMISSION_COMPARISON_LANDING_REQUIRED_SECTIONS = [
  'data-testid="commission-comparison-landing"',
  'data-testid="commission-comparison-calculator"',
  'data-testid="commission-comparison-doordash-p2-46',
  'Honest limitations',
] as const;

export function commissionComparisonLandingCtaHref(
  base: '/signup' | '/book-demo' | '/pricing' | '/dashboard/analytics/delivery-commissions',
): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'seo',
    utm_campaign: COMMISSION_COMPARISON_LANDING_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', '/dashboard/marketing/commission-comparison');
  }
  return `${base}?${params.toString()}`;
}
