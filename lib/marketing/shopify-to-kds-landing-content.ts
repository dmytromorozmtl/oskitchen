import type { RichSolutionLanding } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';

export const SHOPIFY_TO_KDS_LANDING_PATH = '/shopify-to-kds' as const;

export const SHOPIFY_TO_KDS_LANDING_META = {
  title: 'Shopify to KDS — Route Online Orders to Kitchen Display | OS Kitchen',
  description:
    'Connect Shopify webhooks to your kitchen display system — HMAC-verified order ingest, modifier mapping, scheduled fire times, and Integration Health visibility. 14-day free trial.',
  keywords: [
    'shopify to kds',
    'shopify kitchen display',
    'shopify order to kitchen',
    'shopify webhook kds',
    'shopify meal prep kds',
  ],
  utmCampaign: 'shopify_to_kds_seo',
  demoSlug: 'ghost-kitchen',
} as const;

export const SHOPIFY_TO_KDS_SEGMENT_META: SolutionSegmentMeta = {
  emoji: '🛍️',
  trustLine: '14-day free trial · HMAC webhooks · honest BETA labels on connector maturity',
  featuresTag: 'Shopify → KDS flow',
  featuresTitle: 'From Shopify checkout to kitchen ticket — without manual re-entry',
  featuresDescription:
    'Signed webhooks, product mapping, KDS bump/expo handoff, and Integration Health when sync fails — not buried in Shopify Admin logs.',
  comparisonTag: 'Connector comparison',
  faqTag: 'Shopify → KDS FAQ',
  faqTitle: 'Questions from Shopify + kitchen operators',
  faqDescription:
    'Webhook security, modifier mapping, scheduled orders, and honest LIVE/BETA connector labels.',
};

export const SHOPIFY_TO_KDS_LANDING: RichSolutionLanding = {
  badge: 'For Shopify stores with a production line',
  h1: 'Shopify to KDS — Online Orders on Your Kitchen Display',
  subtitle:
    'Route Shopify order/create webhooks into OS Kitchen Order Hub and KDS — with HMAC verification, modifier mapping, scheduled fire times, and Integration Health when sync fails.',
  features: [
    {
      title: 'HMAC webhook ingest',
      description:
        'Signed Shopify order/create and order/updated events — idempotent handling so replays do not duplicate KDS tickets.',
    },
    {
      title: 'Modifier & variant mapping',
      description:
        'Shopify variants map to kitchen prep profiles — allergens, station routing, and packaging notes on the ticket.',
    },
    {
      title: 'KDS bump & expo',
      description:
        'Production board with bump/expo handoff — same queue as POS and catering when those channels are connected.',
    },
    {
      title: 'Integration Health Center',
      description:
        'See exactly why a Shopify sync failed — webhook errors, mapping gaps, and retry guidance for managers.',
    },
  ],
  comparison: {
    title: 'Shopify → KDS: OS Kitchen vs manual bridge',
    competitorALabel: 'Manual re-entry',
    competitorBLabel: 'Generic tablet app',
    rows: [
      { feature: 'HMAC webhook verify', kitchenos: '✅', competitorA: '❌', competitorB: 'Varies' },
      { feature: 'Modifier mapping', kitchenos: '✅', competitorA: 'Manual', competitorB: 'Limited' },
      { feature: 'Scheduled order fire', kitchenos: '✅', competitorA: '❌', competitorB: 'Varies' },
      { feature: 'Integration Health UI', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
      { feature: 'Shared KDS with POS', kitchenos: '✅', competitorA: '❌', competitorB: 'Varies' },
      { feature: '14-day trial', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
    ],
  },
  ctaTitle: 'Connect Shopify to your kitchen display',
  ctaSubtitle:
    'Start a 14-day trial. Run a test order with modifiers and confirm tickets on KDS before launch week.',
};

export const SHOPIFY_TO_KDS_PAIN_POINTS = [
  {
    title: 'Shopify Admin is not a KDS',
    description:
      'Online orders sit in Shopify while the line runs from a separate tablet or printed chits — modifiers get lost in translation.',
  },
  {
    title: 'Webhook failures hide in logs',
    description:
      'HMAC mismatches and mapping gaps fail silently until customers complain — no operator-facing health dashboard.',
  },
  {
    title: 'Scheduled orders fire too early',
    description:
      'Checkout-time tickets overwhelm prep when production should start at lead time — not at payment capture.',
  },
] as const;

export const SHOPIFY_TO_KDS_SOLUTION = {
  title: 'One spine: Shopify webhook → Order Hub → KDS',
  description:
    'OS Kitchen verifies Shopify webhooks, normalizes line items and modifiers, applies fire-time rules, and promotes tickets to KDS — alongside POS and storefront when configured.',
  bullets: [
    'orders/create webhook with HMAC-SHA256 verification',
    'Variant → prep profile mapping with conflict queue',
    'Scheduled orders fire to KDS at production lead time',
    'Integration Health — failed syncs visible to managers',
    'Bump/expo handoff on the same board as in-store orders',
  ],
} as const;

export const SHOPIFY_TO_KDS_FLOW_STEPS = [
  { step: '1', label: 'Shopify checkout', detail: 'Customer completes order online' },
  { step: '2', label: 'Webhook + HMAC', detail: 'Signed order/create ingested idempotently' },
  { step: '3', label: 'Order Hub', detail: 'Modifiers mapped to prep profiles' },
  { step: '4', label: 'KDS ticket', detail: 'Bump → expo → DONE on kitchen display' },
] as const;

export const SHOPIFY_TO_KDS_FEATURE_HIGHLIGHTS = [
  {
    title: 'Webhook security',
    description: 'HMAC-verified Shopify events — invalid signatures rejected before Order Hub.',
    screenshotLabel: 'Webhook verify',
  },
  {
    title: 'Product mapping',
    description: 'SKU/variant mapping to stations, allergens, and packaging — resolve gaps before production.',
    screenshotLabel: 'Mapping queue',
  },
  {
    title: 'KDS production board',
    description: 'Kitchen display with bump and expo columns — same workflow as POS-originated tickets.',
    screenshotLabel: 'KDS board',
  },
  {
    title: 'Integration Health',
    description: 'Operator-facing sync status — not buried in Shopify Admin or server logs.',
    screenshotLabel: 'Health center',
  },
] as const;

export const SHOPIFY_TO_KDS_SCREENSHOTS = [
  { id: 'webhook', title: 'Webhook ingest', caption: 'Signed Shopify events in audit trail.' },
  { id: 'kds', title: 'KDS tickets', caption: 'Shopify orders alongside POS on one board.' },
  { id: 'health', title: 'Integration Health', caption: 'Failed syncs with retry guidance.' },
] as const;

export const SHOPIFY_TO_KDS_TESTIMONIAL_PLACEHOLDER = {
  quote:
    'Shopify orders finally hit KDS without someone re-typing modifiers — we caught mapping gaps in the first ten test tickets before launch week.',
  name: 'Pilot operator — name withheld',
  role: 'Meal prep operator, Shopify + production line (design partner cohort)',
  disclaimer:
    'Illustrative placeholder — not a verified customer quote. Real case studies publish at /customers when available.',
} as const;

export const SHOPIFY_TO_KDS_LIMITATIONS = [
  'Shopify custom app connector is BETA — not listed on Shopify App Store yet; scope disclosed in pilot.',
  'Third-party delivery label auto-routing (DoorDash/Uber) is partner-gated — SKIPPED in default pilot.',
  'Modifier mapping requires initial setup — first ten test orders typically surface gaps.',
  'Unified inventory depletion across Shopify + POS is BETA — not a guaranteed day-one claim.',
  'Multi-location Shopify Plus routing is enterprise roadmap — single-workspace pilot first.',
] as const;

export const SHOPIFY_TO_KDS_FAQ = [
  {
    question: 'Does Shopify connect directly to KDS without OS Kitchen?',
    answer:
      'Shopify does not ship a native KDS. OS Kitchen ingests webhooks, maps products, and promotes tickets to the production board — the honest middleware layer between your storefront and the line.',
  },
  {
    question: 'How are webhooks secured?',
    answer:
      'HMAC-SHA256 signature verification on order/create and order/updated. Invalid signatures return 401 — never promoted to KDS. Idempotency keys prevent duplicate tickets on replay.',
  },
  {
    question: 'What about scheduled Shopify orders?',
    answer:
      'Fire-time rules hold tickets until production lead time — checkout does not immediately flood KDS during off-hours prep windows.',
  },
  {
    question: 'Is the Shopify connector LIVE?',
    answer:
      'Connector maturity is labeled honestly in Integration Health — BETA for custom app install path. Run a test order with modifiers in your staging workspace before claiming LIVE in customer-facing materials.',
  },
] as const;

export const SHOPIFY_TO_KDS_REQUIRED_SECTIONS = [
  'data-testid="shopify-to-kds-landing"',
  'data-testid="shopify-to-kds-pain"',
  'data-testid="shopify-to-kds-features"',
  'Honest limitations',
] as const;

export function getShopifyToKdsLandingContent(): RichSolutionLanding {
  return SHOPIFY_TO_KDS_LANDING;
}

export function getShopifyToKdsSegmentMeta(): SolutionSegmentMeta {
  return SHOPIFY_TO_KDS_SEGMENT_META;
}

export function shopifyToKdsCtaHref(
  base: '/signup' | '/book-demo' | '/demo' | '/pricing' | '/integrations/shopify',
): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'seo',
    utm_campaign: SHOPIFY_TO_KDS_LANDING_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', `/demo/${SHOPIFY_TO_KDS_LANDING_META.demoSlug}`);
  }
  if (base === '/demo') {
    return `/demo/${SHOPIFY_TO_KDS_LANDING_META.demoSlug}?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}
