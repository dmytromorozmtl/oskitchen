import type { RichSolutionLanding } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';
import {
  INTEGRATION_HEALTH_CENTER_SALES_HOOK,
  INTEGRATION_HEALTH_CENTER_SALES_HOOK_SUBTITLE,
} from '@/lib/marketing/integration-health-sales-p1-24-content';

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH = '/restaurant-integration-health' as const;

export const RESTAURANT_INTEGRATION_HEALTH_LANDING_META = {
  title: 'Restaurant Integration Health — See Why DoorDash, Shopify & POS Sync Failed | OS Kitchen',
  description:
    'Monitor restaurant POS integration health — webhook failures, OAuth expiry, stale menu sync, and SKIPPED labels with recovery playbooks. See exactly why your DoorDash integration failed. 14-day free trial.',
  keywords: [
    'restaurant integration health',
    'restaurant pos integration health',
    'restaurant integration monitoring',
    'webhook monitoring restaurant',
    'doordash integration failed',
  ],
  utmCampaign: 'restaurant_integration_health_seo',
  demoSlug: 'ghost-kitchen',
} as const;

export const RESTAURANT_INTEGRATION_HEALTH_SEGMENT_META: SolutionSegmentMeta = {
  emoji: '🔌',
  trustLine: '14-day free trial · honest SKIPPED/BETA labels · recovery playbooks in-app',
  featuresTag: 'Integration Health',
  featuresTitle: 'One pane for every channel — not green tiles that lie',
  featuresDescription:
    'Per-channel health scores, webhook audit trails, catalog sync freshness, and operator-facing recovery steps — for DoorDash, Shopify, WooCommerce, and POS.',
  comparisonTag: 'Monitoring comparison',
  faqTag: 'Integration health FAQ',
  faqTitle: 'Questions from multi-channel operators',
  faqDescription:
    'Health scores vs uptime, SKIPPED labels, DoorDash partner gating, and how this differs from generic monitoring SaaS.',
};

export const RESTAURANT_INTEGRATION_HEALTH_LANDING: RichSolutionLanding = {
  badge: 'For multi-channel kitchens tired of silent sync failures',
  h1: 'Restaurant Integration Health — See Why Sync Failed Before Rush Hour',
  subtitle: INTEGRATION_HEALTH_CENTER_SALES_HOOK_SUBTITLE,
  features: [
    {
      title: 'Per-channel health score',
      description:
        'Freshness signals from webhooks, catalog pulls, and credential checks — not a binary connected badge.',
    },
    {
      title: 'Failure code + playbook',
      description:
        'AUTH_DEGRADED, WEBHOOK_SIGNATURE_MISMATCH, STALE_CATALOG_SYNC — each with an in-app recovery step.',
    },
    {
      title: 'SKIPPED / BETA honesty',
      description:
        'Partner credentials missing? We show SKIPPED instead of fake green — maturity labels match pilot scope.',
    },
    {
      title: 'Today Command Center alerts',
      description:
        'Integration degradation surfaces on Today — managers see sync risk before the line discovers missing tickets.',
    },
  ],
  comparison: {
    title: 'Restaurant integration health: OS Kitchen vs status quo',
    competitorALabel: 'Incumbent POS tiles',
    competitorBLabel: 'Generic monitoring SaaS',
    rows: [
      { feature: 'Per-channel health score', kitchenos: '✅', competitorA: 'Limited', competitorB: '✅' },
      { feature: 'SKIPPED / BETA honesty', kitchenos: '✅', competitorA: '❌', competitorB: 'Varies' },
      { feature: 'Recovery playbooks in-app', kitchenos: '✅', competitorA: '❌', competitorB: 'Add-on' },
      { feature: 'DoorDash failure diagnostic', kitchenos: '✅', competitorA: '❌', competitorB: '❌' },
      { feature: 'Today Command Center alerts', kitchenos: '✅', competitorA: 'Limited', competitorB: '❌' },
      { feature: '14-day trial', kitchenos: '✅', competitorA: 'Varies', competitorB: 'Varies' },
    ],
  },
  ctaTitle: 'Prove integration state before you bet rush hour on a webhook',
  ctaSubtitle:
    'Start a 14-day trial. Connect test shops and review honest maturity labels before launch week.',
};

export const RESTAURANT_INTEGRATION_HEALTH_PAIN_POINTS = [
  {
    title: 'Green tiles hide webhook death',
    description:
      'POS settings show connected while order/create events stopped 14 hours ago — operators find out mid-service.',
  },
  {
    title: 'No failure code for managers',
    description:
      'When DoorDash auth degrades, teams grep logs and Slack — no AUTH_DEGRADED row with a re-auth playbook.',
  },
  {
    title: 'Menu drift across channels',
    description:
      'Catalog sync stale on aggregators while POS shows in stock — modifiers and 86s diverge silently.',
  },
] as const;

export const RESTAURANT_INTEGRATION_HEALTH_SOLUTION = {
  title: 'Integration Health Center — honest signals, not uptime theater',
  description:
    'OS Kitchen scores each channel from sync freshness, webhook failures, and credential checks. SKIPPED when creds are missing. Recovery playbooks when sync degrades.',
  bullets: [
    'Per-channel health score with trend sparklines',
    'Webhook audit trail — signature mismatches surfaced immediately',
    'Catalog sync freshness — STALE_CATALOG_SYNC before items 86 on DoorDash',
    'Recovery playbooks tied to failure codes',
    'Today Command Center alerts for integration degradation',
  ],
} as const;

export const RESTAURANT_INTEGRATION_HEALTH_FLOW_STEPS = [
  { step: '1', label: 'Channel connects', detail: 'Shopify, WooCommerce, POS, or marketplace' },
  { step: '2', label: 'Health scoring', detail: 'Webhooks, catalog, credentials scored' },
  { step: '3', label: 'Degradation detected', detail: 'FAIL / Watch / SKIPPED with code' },
  { step: '4', label: 'Recovery playbook', detail: 'Operator action before rush hour' },
] as const;

export const RESTAURANT_INTEGRATION_HEALTH_FEATURE_HIGHLIGHTS = [
  {
    title: 'Health score engine',
    description: 'Operational signals from sync freshness and webhook success — not guaranteed SLA uptime.',
    screenshotLabel: 'Health scores',
  },
  {
    title: 'Webhook audit',
    description: 'Last successful event, failure count, and signature mismatch detail — visible to managers.',
    screenshotLabel: 'Webhook trail',
  },
  {
    title: 'DoorDash diagnostic',
    description: INTEGRATION_HEALTH_CENTER_SALES_HOOK + ' — failure code and playbook in one row.',
    screenshotLabel: 'DoorDash row',
  },
  {
    title: 'Recovery playbooks',
    description: 'Re-auth, catalog sync, webhook secret rotation — tracked success rates, not magic auto-fix.',
    screenshotLabel: 'Playbooks',
  },
] as const;

export const RESTAURANT_INTEGRATION_HEALTH_SCREENSHOTS = [
  { id: 'health', title: 'Channel health board', caption: 'PASS / Watch / SKIPPED per integration.' },
  { id: 'webhook', title: 'Webhook audit', caption: 'Signature failures with retry guidance.' },
  { id: 'playbook', title: 'Recovery playbook', caption: 'Failure code → operator next step.' },
] as const;

export const RESTAURANT_INTEGRATION_HEALTH_TESTIMONIAL_PLACEHOLDER = {
  quote:
    'When DoorDash auth degraded we used to find out from angry customers — Integration Health showed AUTH_DEGRADED with a re-auth playbook before Saturday service.',
  name: 'Pilot operator — name withheld',
  role: 'Multi-channel operator (design partner cohort)',
  disclaimer:
    'Illustrative placeholder — not a verified customer quote. Real case studies publish at /customers when available.',
} as const;

export const RESTAURANT_INTEGRATION_HEALTH_LIMITATIONS = [
  'Health scores are workspace operational signals — not third-party SLA guarantees or investor-grade uptime claims.',
  'Live DoorDash and Uber Eats ops remain partner-gated or SKIPPED until pilot credentials are wired.',
  'Recovery playbooks track success rates — they do not auto-fix partner outages without operator action.',
  'Hardware fleet posture is pilot scope — not proprietary Clover-style hub telemetry parity.',
  'Generic monitoring SaaS may cover infra uptime; Integration Health covers restaurant-specific sync semantics.',
] as const;

export const RESTAURANT_INTEGRATION_HEALTH_FAQ = [
  {
    question: 'What is restaurant integration health?',
    answer:
      'The operational state of every order channel — webhooks firing, catalog fresh, credentials valid — scored for managers, not buried in server logs.',
  },
  {
    question: 'Does a high health score guarantee uptime?',
    answer:
      'No — scores reflect sync freshness, webhook failures, and credential checks. They are not guaranteed uptime or SLA commitments.',
  },
  {
    question: 'How is this different from /integration-health-center?',
    answer:
      'This SEO landing explains integration health for prospects searching "restaurant integration health." The full sales page lives at /integration-health-center; live dashboard is at /dashboard/integration-health after signup.',
  },
  {
    question: 'What does SKIPPED mean?',
    answer:
      'Partner credentials are missing or smoke proof has not run — we label SKIPPED instead of showing fake green connected badges.',
  },
] as const;

export const RESTAURANT_INTEGRATION_HEALTH_REQUIRED_SECTIONS = [
  'data-testid="restaurant-integration-health-landing"',
  'data-testid="restaurant-integration-health-pain"',
  'data-testid="restaurant-integration-health-features"',
  'Honest limitations',
] as const;

export function getRestaurantIntegrationHealthLandingContent(): RichSolutionLanding {
  return RESTAURANT_INTEGRATION_HEALTH_LANDING;
}

export function getRestaurantIntegrationHealthSegmentMeta(): SolutionSegmentMeta {
  return RESTAURANT_INTEGRATION_HEALTH_SEGMENT_META;
}

export function restaurantIntegrationHealthCtaHref(
  base: '/signup' | '/book-demo' | '/demo' | '/pricing' | '/integration-health-center' | '/dashboard/integration-health',
): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'seo',
    utm_campaign: RESTAURANT_INTEGRATION_HEALTH_LANDING_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', '/dashboard/integration-health');
  }
  if (base === '/demo') {
    return `/demo/${RESTAURANT_INTEGRATION_HEALTH_LANDING_META.demoSlug}?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}
