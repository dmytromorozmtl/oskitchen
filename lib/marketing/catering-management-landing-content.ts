import type { RichSolutionLanding } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';

export const CATERING_MANAGEMENT_LANDING_PATH = '/catering-management' as const;

export const CATERING_MANAGEMENT_LANDING_META = {
  title: 'Catering Management Software — Quotes to Production | OS Kitchen',
  description:
    'Catering management software for event quotes, production planning, packing sheets, and delivery handoff. Software-first — 14-day free trial.',
  keywords: [
    'catering management software',
    'catering production software',
    'event catering software',
    'catering order system',
    'corporate catering kitchen software',
  ],
  utmCampaign: 'catering_management_seo',
  demoSlug: 'catering',
} as const;

export const CATERING_MANAGEMENT_SEGMENT_META: SolutionSegmentMeta = {
  emoji: '🍽️',
  trustLine: '14-day free trial · Built for event and corporate catering operators',
  featuresTag: 'Built for catering',
  featuresTitle: 'One ops surface from quote acceptance to delivery handoff',
  featuresDescription:
    'Turn accepted quotes into production waves, packing sheets, and delivery routes — with honest BETA labels where dispatch depth is still maturing.',
  comparisonTag: 'Catering comparison',
  faqTag: 'Catering FAQ',
  faqTitle: 'Questions from catering operators',
  faqDescription:
    'Quote-to-production, event scheduling, packing, and delivery routing — answered without overclaiming dispatch parity.',
};

export const CATERING_MANAGEMENT_LANDING: RichSolutionLanding = {
  badge: 'For event & corporate catering operators',
  h1: 'Catering Management Software — Quotes, Production & Delivery',
  subtitle:
    'Accept event quotes, schedule production waves, generate packing sheets, and coordinate delivery handoff — without spreadsheet chaos between sales and the kitchen.',
  features: [
    {
      title: 'Quote-to-production',
      description:
        'Convert accepted catering quotes into production tasks with yield-aware quantities when recipes exist — one path from sales to prep.',
    },
    {
      title: 'Event order hub',
      description:
        'Corporate, wedding, and venue orders normalize into one prioritized queue with event date, headcount, and dietary labels.',
    },
    {
      title: 'Packing sheets',
      description:
        'Lane sheets and verification checkpoints before load-out — reduce wrong-tray incidents on multi-course events.',
    },
    {
      title: 'Delivery routing',
      description:
        'Plan load-out windows and delivery stops when dispatch modules are enabled in pilot — labeled BETA, not live fleet optimization.',
    },
    {
      title: 'Corporate CRM',
      description:
        'Track repeat corporate clients and event segments without a separate CRM for every catering relationship.',
    },
    {
      title: 'Integration health',
      description:
        'Honest maturity labels for WooCommerce, Shopify, and manual import channels — no fake green integration badges.',
    },
  ],
  comparison: {
    title: 'How OS Kitchen compares for catering operators',
    competitorALabel: 'Spreadsheets',
    competitorBLabel: 'Generic catering SaaS',
    rows: [
      { feature: 'Quote-to-production workflow', kitchenos: '✅', competitorA: 'Manual', competitorB: 'Varies' },
      { feature: 'Event production waves', kitchenos: '✅', competitorA: 'Manual', competitorB: 'Limited' },
      { feature: 'Packing verification', kitchenos: '✅', competitorA: '❌', competitorB: 'Varies' },
      { feature: 'Delivery dispatch (BETA)', kitchenos: '✅ Pilot', competitorA: '❌', competitorB: 'Add-on' },
      { feature: 'Software-first (no hardware lease)', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
      { feature: '14-day trial', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
    ],
  },
  ctaTitle: 'Run your catering ops on one honest system',
  ctaSubtitle:
    'Start a 14-day trial. Import event orders, schedule a production wave, and evaluate packing and dispatch with realistic BETA labels.',
};

export const CATERING_MANAGEMENT_PAIN_POINTS = [
  {
    title: 'Sales-to-kitchen handoff breaks',
    description:
      'Accepted quotes live in email while production schedules in spreadsheets — kitchen prep starts before headcount changes land.',
  },
  {
    title: 'Wrong-tray load-out incidents',
    description:
      'Multi-course events need packing verification — manual checklists miss dietary swaps under rush load-out.',
  },
  {
    title: 'No honest dispatch path',
    description:
      'Delivery routing lives in driver texts — no trackable handoff from packing complete to on-site setup.',
  },
] as const;

export const CATERING_MANAGEMENT_SOLUTION = {
  title: 'One catering OS for quotes, production, packing, and delivery',
  description:
    'OS Kitchen connects event order hub, production calendar waves, packing sheets, and optional delivery routing — with honest BETA labels where dispatch depth is still maturing.',
  bullets: [
    'Order hub with event date, headcount, and dietary labels',
    'Production board — batch quantities from confirmed catering orders',
    'Catering dashboard — quotes, events, production KPIs (BETA)',
    'Packing verification before load-out and on-site handoff',
    'Integration Health Center — Woo/Shopify/manual import maturity labels',
  ],
} as const;

export const CATERING_MANAGEMENT_FEATURE_HIGHLIGHTS = [
  {
    title: 'Quote-to-production',
    description: 'Accepted quotes become production tasks with yield-aware batch quantities.',
    screenshotLabel: 'Quote to production',
  },
  {
    title: 'Event order hub',
    description: 'Prioritized queue by event date — filter by client, venue, or fulfillment type.',
    screenshotLabel: 'Event order hub',
  },
  {
    title: 'Packing sheets',
    description: 'Verification checkpoints before trays leave the commissary or event kitchen.',
    screenshotLabel: 'Packing sheets',
  },
  {
    title: 'Delivery routing',
    description: 'Load-out windows and stop planning when dispatch pilot modules are enabled.',
    screenshotLabel: 'Delivery routing',
  },
  {
    title: 'Corporate CRM',
    description: 'Repeat client segments and communication history for corporate catering.',
    screenshotLabel: 'Corporate CRM',
  },
] as const;

export const CATERING_MANAGEMENT_SCREENSHOTS = [
  {
    id: 'event-hub',
    title: 'Event order hub',
    caption: 'All catering events in one prioritized queue.',
  },
  {
    id: 'production',
    title: 'Production waves',
    caption: 'Batch prep scheduled by event and course.',
  },
  {
    id: 'packing',
    title: 'Packing verification',
    caption: 'Tray checks before load-out (BETA).',
  },
] as const;

export const CATERING_MANAGEMENT_TESTIMONIAL_PLACEHOLDER = {
  quote:
    'We stopped losing headcount changes between sales email and the prep sheet — every accepted quote lands in one queue with the right event date.',
  name: 'Pilot operator — name withheld',
  role: 'Catering ops lead, corporate events (design partner cohort)',
  disclaimer:
    'Illustrative placeholder — not a verified customer quote. Real case studies publish at /customers when available.',
} as const;

export const CATERING_MANAGEMENT_LIMITATIONS = [
  'Delivery dispatch optimization is BETA — not live fleet GPS parity; pilot scope only.',
  'Full banquet-service staffing and tip-pool accounting are not in v1 pilot scope.',
  'Marketplace delivery live ops (DoorDash/Uber) are SKIPPED — partner-gated.',
  'Multi-location catering P&L snapshots are operational views — not audited financial statements.',
  'Quote PDF designer parity with legacy catering CRMs is roadmap-only.',
] as const;

export const CATERING_MANAGEMENT_FAQ = [
  {
    question: 'Can catering and commissary production share one OS Kitchen workspace?',
    answer:
      'Pilot scope supports catering event orders alongside commissary or meal-prep production when workflows align. Disclose multi-segment scope in sales calls — full segment isolation is enterprise roadmap.',
  },
  {
    question: 'Is delivery dispatch live for all events?',
    answer:
      'No — delivery routing and load-out planning are BETA. Useful when dispatch modules are enabled in your pilot workspace. Label honestly in client-facing materials.',
  },
  {
    question: 'Do you replace dedicated catering CRM or quote tools?',
    answer:
      'OS Kitchen is a kitchen operations layer — order hub, production, packing, optional dispatch. Full CRM/quote designer replacement is explicitly out of 90-day pilot scope.',
  },
  {
    question: 'How long is the free trial?',
    answer:
      '14 days on Pro/Team trial tiers. Import event orders, schedule a production wave, and evaluate catering dashboard modules with your real workflow.',
  },
] as const;

export function getCateringManagementLandingContent(): RichSolutionLanding {
  return CATERING_MANAGEMENT_LANDING;
}

export function getCateringManagementSegmentMeta(): SolutionSegmentMeta {
  return CATERING_MANAGEMENT_SEGMENT_META;
}

export function cateringManagementCtaHref(
  base: '/signup' | '/book-demo' | '/demo' | '/pricing',
): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'seo',
    utm_campaign: CATERING_MANAGEMENT_LANDING_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', `/demo/${CATERING_MANAGEMENT_LANDING_META.demoSlug}`);
  }
  if (base === '/demo') {
    return `/demo/${CATERING_MANAGEMENT_LANDING_META.demoSlug}?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}
