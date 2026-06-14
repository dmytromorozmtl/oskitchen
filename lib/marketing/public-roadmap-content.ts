/**
 * Public roadmap content — honest capability status for /roadmap.
 *
 * @see docs/PRODUCT_ROADMAP_2026.md
 * @see docs/STRATEGIC_ROADMAP.md
 */

export const PUBLIC_ROADMAP_PATH = '/roadmap' as const;

export const PUBLIC_ROADMAP_TEST_ID = 'public-roadmap-page' as const;

export const PUBLIC_ROADMAP_META = {
  title: 'Product Roadmap — What We Are Building | OS Kitchen',
  description:
    'Honest public roadmap: pilot hardening, BETA integrations, and what is deferred until design partners sign. No fake LIVE claims.',
  keywords: [
    'os kitchen roadmap',
    'restaurant software roadmap',
    'kitchen operating system roadmap',
    'meal prep software roadmap 2026',
  ],
  utmCampaign: 'public_roadmap_seo',
} as const;

export type PublicRoadmapStatus =
  | 'live'
  | 'beta'
  | 'roadmap'
  | 'partner'
  | 'deferred';

export type PublicRoadmapConfidence = 'high' | 'medium' | 'conditional';

export type PublicRoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: PublicRoadmapStatus;
  confidence: PublicRoadmapConfidence;
};

export type PublicRoadmapQuarter = {
  id: string;
  label: string;
  theme: string;
  items: PublicRoadmapItem[];
};

export const PUBLIC_ROADMAP_STATUS_LABELS: Record<PublicRoadmapStatus, string> = {
  live: 'In product',
  beta: 'BETA',
  roadmap: 'Roadmap',
  partner: 'Partner required',
  deferred: 'Deferred',
};

export const PUBLIC_ROADMAP_CONFIDENCE_LABELS: Record<PublicRoadmapConfidence, string> = {
  high: 'High confidence',
  medium: 'Medium — quarter target',
  conditional: 'Conditional — partner or demand signal',
};

export const PUBLIC_ROADMAP_QUARTERS: PublicRoadmapQuarter[] = [
  {
    id: 'q2-2026',
    label: 'Q2 2026 — Now',
    theme: 'Learn, stabilize, activate (paid pilot)',
    items: [
      {
        id: 'order-hub-kds',
        title: 'Order hub → KDS → packing',
        description: 'Unified production path from channel intake to expo handoff.',
        status: 'live',
        confidence: 'high',
      },
      {
        id: 'today-command-center',
        title: 'Today Command Center',
        description: 'Daily briefing, alerts, and jump links for owners.',
        status: 'live',
        confidence: 'high',
      },
      {
        id: 'woo-shopify-beta',
        title: 'WooCommerce & Shopify import',
        description: 'Webhook HMAC, menu mapping, certification kit per tenant.',
        status: 'beta',
        confidence: 'high',
      },
      {
        id: 'storefront-beta',
        title: 'Native storefront checkout',
        description: 'Owned-channel ordering with honest BETA labels until GA gates pass.',
        status: 'beta',
        confidence: 'high',
      },
      {
        id: 'integration-health',
        title: 'Integration Health Center',
        description: 'See why a channel sync failed — SKIPPED and BETA states visible.',
        status: 'beta',
        confidence: 'high',
      },
      {
        id: 'design-partner-program',
        title: 'Design partner program',
        description: 'Founding operator cohort — 0 signed LOIs as of June 2026.',
        status: 'live',
        confidence: 'high',
      },
    ],
  },
  {
    id: 'q3-2026',
    label: 'Q3 2026 — Next',
    theme: 'Retention, efficiency, second location prep',
    items: [
      {
        id: 'reporting-ga',
        title: 'Executive reporting & exports',
        description: 'Margin, costing polish, and scheduled export schedules.',
        status: 'roadmap',
        confidence: 'medium',
      },
      {
        id: 'catering-deposits',
        title: 'Catering quote → order + deposits',
        description: 'Quote conversion with Stripe deposit links.',
        status: 'roadmap',
        confidence: 'medium',
      },
      {
        id: 'webhook-health',
        title: 'Webhook health dashboard',
        description: 'Replay guardrails and operator-facing integration diagnostics.',
        status: 'roadmap',
        confidence: 'medium',
      },
      {
        id: 'public-api-v1',
        title: 'Public API v1 docs',
        description: 'Workspace API keys with rate limit tiers.',
        status: 'roadmap',
        confidence: 'medium',
      },
      {
        id: 'meal-plan-renew',
        title: 'Meal plan auto-renew & skip/pause',
        description: 'Subscription cadence for meal-prep operators.',
        status: 'roadmap',
        confidence: 'medium',
      },
    ],
  },
  {
    id: 'q4-2026',
    label: 'Q4 2026 — Later',
    theme: 'Multi-site, enterprise pipeline, operational excellence',
    items: [
      {
        id: 'multi-location',
        title: 'Multi-location UX & cross-site reporting',
        description: 'Location switcher and consolidated owner views.',
        status: 'roadmap',
        confidence: 'medium',
      },
      {
        id: 'sso-enterprise',
        title: 'SSO (SAML/OIDC) pilot',
        description: 'One design partner with 3+ locations required before engineering.',
        status: 'roadmap',
        confidence: 'conditional',
      },
      {
        id: 'dpa-self-serve',
        title: 'Self-serve data export & delete',
        description: 'DPA automation and audit log retention.',
        status: 'roadmap',
        confidence: 'medium',
      },
      {
        id: 'uber-eats-partner',
        title: 'Uber Eats marketplace',
        description: 'No calendar commitment without signed partner API access.',
        status: 'partner',
        confidence: 'conditional',
      },
    ],
  },
];

export const PUBLIC_ROADMAP_OUT_OF_SCOPE: PublicRoadmapItem[] = [
  {
    id: 'sms-notifications',
    title: 'SMS notifications',
    description: 'TCPA and provider cost — email and in-app only in 2026.',
    status: 'deferred',
    confidence: 'conditional',
  },
  {
    id: 'pos-offline',
    title: 'POS offline mode',
    description: 'Online-first pilot — offline PCI path not sales-safe; no quarter date.',
    status: 'deferred',
    confidence: 'conditional',
  },
  {
    id: 'doordash-native',
    title: 'DoorDash native connector',
    description: 'No connector in repo — 0 engineering until partner contract.',
    status: 'partner',
    confidence: 'conditional',
  },
  {
    id: 'stripe-terminal',
    title: 'Native payment terminals (Stripe Terminal SDK)',
    description:
      'native payment terminal deferred — browser POS on BYOD, cash/external terminal, and hosted checkout today; reader SDK has no calendar date.',
    status: 'deferred',
    confidence: 'conditional',
  },
  {
    id: 'consumer-app',
    title: 'Native consumer app (App Store / Play Store)',
    description:
      'Deferred until 500+ paying operators — branded storefront PWA and mobile web checkout today; 0 customers as of June 2026.',
    status: 'deferred',
    confidence: 'conditional',
  },
  {
    id: 'field-sales',
    title: 'Field sales / local rep network',
    description:
      'digital-only go-to-market — self-serve signup, book demo, and founder-led design partner outreach; no on-site sales force.',
    status: 'deferred',
    confidence: 'conditional',
  },
  {
    id: 'native-ios-app',
    title: 'Native iOS operator app (App Store)',
    description:
      'native iOS deferred — browser dashboard, POS, and KDS on iPad/iPhone via mobile Safari or Chrome; no staff App Store download.',
    status: 'deferred',
    confidence: 'conditional',
  },
];

export const PUBLIC_ROADMAP_HONESTY_DISCLAIMER =
  'Roadmap items reflect June 2026 engineering status — not a delivery guarantee. Quarter labels (Q2–Q4 2026) are targets, not commitments. Hardware and native terminals stay under Out of scope with no calendar dates. BETA labels stay until certification gates pass. 0 signed founding customers; design partner program open.';

export const PUBLIC_ROADMAP_REQUIRED_SECTIONS = [
  `data-testid="${PUBLIC_ROADMAP_TEST_ID}"`,
  'Honesty disclaimer',
  'Out of scope',
  'Q2 2026',
  'Q3 2026',
  'Q4 2026',
] as const;

export function publicRoadmapCtaHref(
  base: '/book-demo' | '/pricing' | '/blog/why-we-built-os-kitchen',
): string {
  return `${base}?utm_source=public_roadmap&utm_campaign=${PUBLIC_ROADMAP_META.utmCampaign}`;
}
