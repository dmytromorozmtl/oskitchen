import type { RichSolutionLanding } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING_PATH = '/commissary-kitchen-software' as const;

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING_META = {
  title: 'Commissary Kitchen Software — Multi-Tenant Production | OS Kitchen',
  description:
    'Commissary kitchen software for shared production, tenant order routing, batch prep, and B2B marketplace catalog (BETA). Software-first — 14-day free trial.',
  keywords: [
    'commissary kitchen software',
    'shared kitchen software',
    'commissary production management',
    'multi-tenant kitchen ops',
    'cloud kitchen hub software',
  ],
  utmCampaign: 'commissary_kitchen_software_seo',
  demoSlug: 'ghost-kitchen',
} as const;

export const COMMISSARY_KITCHEN_SOFTWARE_SEGMENT_META: SolutionSegmentMeta = {
  emoji: '🏭',
  trustLine: '14-day free trial · Built for shared production facilities',
  featuresTag: 'Built for commissaries',
  featuresTitle: 'One ops surface for tenants, brands, and batch production',
  featuresDescription:
    'Route tenant orders to the right production lane, run batch waves with yield-aware quantities, and optionally supply B2B catalog checkout — with honest BETA labels.',
  comparisonTag: 'Commissary comparison',
  faqTag: 'Commissary FAQ',
  faqTitle: 'Questions from commissary operators',
  faqDescription:
    'Multi-tenant routing, marketplace B2B, production calendar, and pilot scope — answered without ERP overclaims.',
};

export const COMMISSARY_KITCHEN_SOFTWARE_LANDING: RichSolutionLanding = {
  badge: 'For commissary & shared kitchen operators',
  h1: 'Commissary Kitchen Software — Multi-Tenant Production & B2B Supply',
  subtitle:
    'Run batch production waves, route tenant orders to the right lane, and optionally supply B2B marketplace catalog to tenant kitchens — without spreadsheet scheduling and manual invoicing chaos.',
  features: [
    {
      title: 'Production calendar',
      description:
        'Schedule batch waves with yield-aware quantities when recipes exist — one calendar for internal brands and tenant clients.',
    },
    {
      title: 'Multi-tenant order hub',
      description:
        'Tenant storefront, manual, and channel imports normalize into one prioritized queue with tenant and brand labels.',
    },
    {
      title: 'Packing verification',
      description:
        'Lane sheets and verification checkpoints before handoff — reduce wrong-batch incidents in shared facilities.',
    },
    {
      title: 'B2B marketplace catalog',
      description:
        'Commissary-as-vendor supply to tenant kitchens when vendors onboard in pilot — labeled BETA, not a live national network.',
    },
    {
      title: 'CRM & tenant segments',
      description:
        'Track tenant clients and communication segments without a separate email tool for every facility relationship.',
    },
    {
      title: 'Integration health',
      description:
        'Honest maturity labels for WooCommerce, Shopify, and channel imports per tenant — no fake green integration badges.',
    },
  ],
  comparison: {
    title: 'How OS Kitchen compares for commissary operators',
    competitorALabel: 'Spreadsheets',
    competitorBLabel: 'Generic ERP-lite',
    rows: [
      { feature: 'Multi-tenant order routing', kitchenos: '✅', competitorA: 'Manual', competitorB: 'Limited' },
      { feature: 'Production batch waves', kitchenos: '✅', competitorA: 'Manual', competitorB: 'Add-on' },
      { feature: 'Packing verification', kitchenos: '✅', competitorA: '❌', competitorB: 'Limited' },
      { feature: 'B2B marketplace (BETA)', kitchenos: '✅ Pilot', competitorA: '❌', competitorB: 'Varies' },
      { feature: 'Software-first (no hardware lease)', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
      { feature: '14-day trial', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
    ],
  },
  ctaTitle: 'Run your commissary on one honest ops system',
  ctaSubtitle:
    'Start a 14-day trial. Import tenant orders, schedule production waves, and evaluate B2B catalog with realistic BETA labels.',
};

export const COMMISSARY_KITCHEN_SOFTWARE_PAIN_POINTS = [
  {
    title: 'Tenant onboarding takes weeks',
    description:
      'Each tenant runs separate POS or storefront islands — commissary production schedules in spreadsheets that lag reality.',
  },
  {
    title: 'Wrong-batch incidents',
    description:
      'Shared facility scheduling gaps route orders to the wrong lane — rework costs margin before anyone updates the master sheet.',
  },
  {
    title: 'No honest tenant supply path',
    description:
      'Commissary wants to sell ingredients to tenants but invoicing and catalog live in email threads — not a trackable B2B workflow.',
  },
] as const;

export const COMMISSARY_KITCHEN_SOFTWARE_SOLUTION = {
  title: 'One commissary OS for production, tenants, and optional B2B supply',
  description:
    'OS Kitchen connects tenant order routing, production calendar waves, packing verification, and optional B2B marketplace catalog — with honest BETA labels where integrations and marketplace depth are still maturing.',
  bullets: [
    'Order hub with tenant and brand labels across channels',
    'Production board — batch quantities from confirmed tenant orders',
    'Commissary OS dashboard — scheduling, tenant views, production KPIs (BETA)',
    'B2B marketplace catalog/checkout for commissary-as-vendor (BETA)',
    'Integration Health Center — per-tenant Woo/Shopify maturity labels',
  ],
} as const;

export const COMMISSARY_KITCHEN_SOFTWARE_FEATURE_HIGHLIGHTS = [
  {
    title: 'Production calendar',
    description: 'Batch waves and yields for internal brands and external tenant clients in one schedule.',
    screenshotLabel: 'Production calendar',
  },
  {
    title: 'Multi-tenant order hub',
    description: 'Prioritized queue with tenant routing — filter by brand, channel, or fulfillment type.',
    screenshotLabel: 'Tenant order hub',
  },
  {
    title: 'Packing verification',
    description: 'Checkpoint packing before handoff to tenants or delivery partners.',
    screenshotLabel: 'Packing verification',
  },
  {
    title: 'B2B marketplace',
    description: 'Commissary supply catalog for tenant kitchens when pilot vendors onboard.',
    screenshotLabel: 'B2B catalog',
  },
  {
    title: 'Tenant CRM',
    description: 'Segments and communication history for commissary client relationships.',
    screenshotLabel: 'Tenant CRM',
  },
] as const;

export const COMMISSARY_KITCHEN_SOFTWARE_SCREENSHOTS = [
  {
    id: 'tenant-hub',
    title: 'Tenant order hub',
    caption: 'All tenant channels in one prioritized queue.',
  },
  {
    id: 'production',
    title: 'Production waves',
    caption: 'Batch prep scheduled by wave and yield.',
  },
  {
    id: 'marketplace',
    title: 'B2B catalog',
    caption: 'Commissary-as-vendor supply path (BETA).',
  },
] as const;

export const COMMISSARY_KITCHEN_SOFTWARE_TESTIMONIAL_PLACEHOLDER = {
  quote:
    'We stopped losing tenant orders between email and the production whiteboard — every client ticket lands in one queue with the right lane label.',
  name: 'Pilot operator — name withheld',
  role: 'Commissary manager, shared kitchen hub (design partner cohort)',
  disclaimer:
    'Illustrative placeholder — not a verified customer quote. Real case studies publish at /customers when available.',
} as const;

export const COMMISSARY_KITCHEN_SOFTWARE_LIMITATIONS = [
  'B2B HoReCa marketplace is BETA — not a live national supplier network; vendor seeding required in pilot.',
  'Full ERP/MRP and automated tenant rent accounting are not in v1 pilot scope.',
  'Marketplace delivery live ops (DoorDash/Uber) are SKIPPED — partner-gated.',
  'SOC 2 in progress — Type I target Q4 2026 (not certified); see SOC2 roadmap doc.',
  'Tenant P&L snapshots are operational views — not audited financial statements.',
] as const;

export const COMMISSARY_KITCHEN_SOFTWARE_FAQ = [
  {
    question: 'Can commissary and tenant kitchens share one OS Kitchen workspace?',
    answer:
      'Pilot scope supports commissary production with tenant order routing and labels. Full multi-tenant billing isolation and per-tenant SSO are enterprise roadmap — disclose scope in sales calls.',
  },
  {
    question: 'Is the B2B marketplace live for all tenants?',
    answer:
      'No — B2B catalog and checkout are BETA. Useful when commissary-as-vendor and approved suppliers are onboarded in your pilot workspace. Label honestly in tenant-facing materials.',
  },
  {
    question: 'Do you replace commissary ERP or MRP systems?',
    answer:
      'OS Kitchen is a kitchen operations layer — order hub, production, packing, optional B2B supply. Full ERP/MRP replacement is explicitly out of 90-day pilot scope.',
  },
  {
    question: 'How long is the free trial?',
    answer:
      '14 days on Pro/Team trial tiers. Import tenant orders, schedule a production wave, and evaluate commissary dashboard modules with your real workflow.',
  },
] as const;

export function getCommissaryKitchenSoftwareLandingContent(): RichSolutionLanding {
  return COMMISSARY_KITCHEN_SOFTWARE_LANDING;
}

export function getCommissaryKitchenSoftwareSegmentMeta(): SolutionSegmentMeta {
  return COMMISSARY_KITCHEN_SOFTWARE_SEGMENT_META;
}

export function commissaryKitchenSoftwareCtaHref(
  base: '/signup' | '/book-demo' | '/demo' | '/pricing',
): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'seo',
    utm_campaign: COMMISSARY_KITCHEN_SOFTWARE_LANDING_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', `/demo/${COMMISSARY_KITCHEN_SOFTWARE_LANDING_META.demoSlug}`);
  }
  if (base === '/demo') {
    return `/demo/${COMMISSARY_KITCHEN_SOFTWARE_LANDING_META.demoSlug}?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}
