import type { RichSolutionLanding, RichSolutionSlug } from '@/lib/marketing/solution-landing-content';
import { RICH_SOLUTION_LANDING } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';
import { SOLUTION_SEGMENT_META } from '@/lib/marketing/solution-segment-meta';

export const ICP_LANDING_SLUGS = ['ghost-kitchen', 'meal-prep', 'weekly-preorder'] as const;

export type IcpLandingSlug = (typeof ICP_LANDING_SLUGS)[number];

export type IcpLandingConfig = {
  slug: IcpLandingSlug;
  path: `/landing/${IcpLandingSlug}`;
  /** Interactive demo vertical */
  demoSlug: string;
  richSolutionSlug?: RichSolutionSlug;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  breadcrumbLabel: string;
  content: RichSolutionLanding;
  segmentMeta: SolutionSegmentMeta;
  limitations: string[];
  faq: Array<{ question: string; answer: string }>;
  utmCampaign: string;
};

const WEEKLY_PREORDER_CONTENT: RichSolutionLanding = {
  badge: 'For weekly preorder food brands',
  h1: 'Weekly Preorder Software — Cutoffs, Production, Pickup',
  subtitle:
    'Publish a weekly menu with order deadlines, translate confirmed demand into production quantities, and run pickup waves — without reconciling WhatsApp and spreadsheets every Sunday.',
  features: [
    {
      title: 'Preorder cutoff enforcement',
      description:
        'Lock ordering before production day so your kitchen cooks to confirmed volume — not optimistic guesses.',
    },
    {
      title: 'Pickup window capacity',
      description:
        'Slot-based pickup when configured — spread handoffs across service windows instead of one chaotic hour.',
    },
    {
      title: 'Production board',
      description:
        'Batch prep from confirmed orders. Yield-aware quantities when recipes are configured in your workspace.',
    },
    {
      title: 'Branded storefront',
      description:
        'Hosted preorder site with Stripe checkout when configured. Customers order online; ops runs one queue.',
    },
    {
      title: 'Packing by customer or route',
      description:
        'Lane sheets grouped for verification before handoff — reduce wrong-bag mistakes on pickup day.',
    },
    {
      title: 'Counter POS for walk-ins',
      description:
        'Software POS for same-day add-ons alongside weekly preorders — no proprietary terminal lease required.',
    },
  ],
  comparison: {
    title: 'Weekly preorder operations comparison',
    competitorALabel: 'Spreadsheets + DMs',
    competitorBLabel: 'Generic POS',
    rows: [
      { feature: 'Weekly menu + cutoff', kitchenos: '✅', competitorA: 'Manual', competitorB: '❌' },
      { feature: 'Production from orders', kitchenos: '✅', competitorA: 'Manual', competitorB: 'Limited' },
      { feature: 'Pickup slot capacity', kitchenos: '✅ When configured', competitorA: '❌', competitorB: 'Varies' },
      { feature: 'Online preorder checkout', kitchenos: '✅ With Stripe', competitorA: '❌', competitorB: 'Add-on' },
      { feature: '14-day trial', kitchenos: '✅', competitorA: 'N/A', competitorB: 'Varies' },
    ],
  },
  ctaTitle: 'Run your weekly preorder cycle on one system',
  ctaSubtitle:
    'Start a 14-day trial. Set your menu, cutoff, and see production and packing from real preorder volume.',
};

const WEEKLY_PREORDER_META: SolutionSegmentMeta = {
  emoji: '📅',
  trustLine: '14-day free trial · Built for weekly menu cycles',
  featuresTag: 'Built for weekly preorders',
  featuresTitle: 'From cutoff to pickup without spreadsheet chaos',
  featuresDescription:
    'OS Kitchen connects weekly menus, confirmed orders, production, and pickup — so service day reflects what customers actually bought.',
  comparisonTag: 'Weekly preorder comparison',
  faqTag: 'Weekly preorder FAQ',
  faqTitle: 'Questions from weekly preorder brands',
  faqDescription:
    'Cutoffs, storefront checkout, pickup slots, and trial scope — answered without overpromising automation.',
};

const WEEKLY_PREORDER_LIMITATIONS = [
  'Marketplace delivery apps (Uber Eats, DoorDash) remain partner-gated — not unified live ops claims.',
  'Cross-channel inventory depletion is POS-scoped today — not full unified stock across Woo/Shopify unless configured and proven.',
  'Native meal-plan subscriptions are BETA — WooCommerce Subscriptions bridge is read-only placeholder.',
  'Enterprise SSO and SCIM are not production-certified — pilot scope only.',
];

const GHOST_KITCHEN_LIMITATIONS = [
  'WooCommerce and Shopify channel imports are BETA — require your credentials and honest integration health review.',
  'Marketplace aggregator live ops are not certified — partner-required for Uber Eats and similar.',
  'Unified inventory depletion across all channels is not a production sales claim today.',
  'Multi-brand P&L is dashboard snapshot — not audited financial reporting.',
];

const MEAL_PREP_LIMITATIONS = [
  'Stripe storefront checkout requires Stripe Connect configuration in your workspace.',
  'Ingredient demand rollups need recipes configured — not a full ERP or purchasing automation suite.',
  'Delivery route optimization is partial — third-party courier dispatch is on the roadmap.',
  'Cross-channel loyalty earn/redeem is not live across all channels.',
];

export const ICP_LANDING_CONFIG: Record<IcpLandingSlug, IcpLandingConfig> = {
  'ghost-kitchen': {
    slug: 'ghost-kitchen',
    path: '/landing/ghost-kitchen',
    demoSlug: 'ghost-kitchen',
    richSolutionSlug: 'ghost-kitchens',
    metaTitle: 'Ghost Kitchen Software — Multi-Brand Operations | OS Kitchen',
    metaDescription:
      'Run virtual brands from one kitchen — shared KDS, channel imports when configured, and honest integration health. 14-day free trial.',
    keywords: [
      'ghost kitchen software',
      'virtual brand kitchen',
      'multi-brand kitchen operations',
      'cloud kitchen platform',
    ],
    breadcrumbLabel: 'Ghost kitchen',
    content: RICH_SOLUTION_LANDING['ghost-kitchens'],
    segmentMeta: SOLUTION_SEGMENT_META['ghost-kitchens'],
    limitations: GHOST_KITCHEN_LIMITATIONS,
    faq: [
      {
        question: 'How many virtual brands can I run?',
        answer:
          'Workspace brand limits depend on your plan. The multi-brand dashboard shows cross-brand orders and snapshots when brands are configured — confirm limits on pricing before scaling.',
      },
      {
        question: 'Do you integrate with delivery marketplaces?',
        answer:
          'WooCommerce and Shopify imports are available in BETA when you configure credentials. Marketplace live ops remain partner-gated — we show honest maturity labels, not fake green badges.',
      },
      {
        question: 'Is hardware required?',
        answer:
          'No proprietary terminals. Run KDS and POS on tablets and browsers you already own. Stripe Terminal is optional for card-present when configured.',
      },
    ],
    utmCampaign: 'icp_ghost_kitchen',
  },
  'meal-prep': {
    slug: 'meal-prep',
    path: '/landing/meal-prep',
    demoSlug: 'meal-prep',
    richSolutionSlug: 'meal-prep',
    metaTitle: 'Meal Prep Software — Weekly Production & Packing | OS Kitchen',
    metaDescription:
      'Meal prep operations from weekly menu to packed delivery — preorders, production board, packing labels. 14-day free trial.',
    keywords: [
      'meal prep software',
      'meal prep business software',
      'weekly meal prep operations',
      'meal subscription kitchen',
    ],
    breadcrumbLabel: 'Meal prep',
    content: RICH_SOLUTION_LANDING['meal-prep'],
    segmentMeta: SOLUTION_SEGMENT_META['meal-prep'],
    limitations: MEAL_PREP_LIMITATIONS,
    faq: [
      {
        question: 'Can I run subscription meal plans?',
        answer:
          'Native meal plans and subscriptions are BETA in OS Kitchen. WooCommerce Subscriptions visibility is read-only placeholder — billing may stay in Woo for Woo-primary merchants.',
      },
      {
        question: 'Does the storefront include online checkout?',
        answer:
          'Yes when Stripe Connect is configured — hosted preorder checkout on your branded storefront. Without Stripe, use manual or external payment flows per your pilot scope.',
      },
      {
        question: 'How long is the free trial?',
        answer: '14 days on Pro/Team trial tiers. Import your menu, set cutoffs, and evaluate production and packing with your real workflow.',
      },
    ],
    utmCampaign: 'icp_meal_prep',
  },
  'weekly-preorder': {
    slug: 'weekly-preorder',
    path: '/landing/weekly-preorder',
    demoSlug: 'meal-prep',
    metaTitle: 'Weekly Preorder Software — Menu, Cutoff & Pickup | OS Kitchen',
    metaDescription:
      'Weekly preorder brands: publish menus, enforce cutoffs, run production and pickup waves from one dashboard. 14-day free trial.',
    keywords: [
      'weekly preorder software',
      'preorder food business',
      'weekly menu cutoff',
      'pickup window scheduling',
    ],
    breadcrumbLabel: 'Weekly preorder',
    content: WEEKLY_PREORDER_CONTENT,
    segmentMeta: WEEKLY_PREORDER_META,
    limitations: WEEKLY_PREORDER_LIMITATIONS,
    faq: [
      {
        question: 'How is this different from meal prep software?',
        answer:
          'Same OS Kitchen platform — this landing focuses on weekly menu + cutoff + pickup workflows for brands that run recurring preorder cycles (bakeries, meal boxes, specialty food).',
      },
      {
        question: 'Can customers order after the cutoff?',
        answer:
          'Cutoff rules are enforced on the storefront when configured — after cutoff, the weekly menu closes for production planning. Same-day counter orders can still flow through POS when enabled.',
      },
      {
        question: 'Do you replace my existing website?',
        answer:
          'OS Kitchen includes a branded storefront option. You can also ingest orders from WooCommerce or Shopify in BETA when configured — see integration health before claiming live sync.',
      },
    ],
    utmCampaign: 'icp_weekly_preorder',
  },
};

export function getIcpLandingConfig(slug: IcpLandingSlug): IcpLandingConfig {
  return ICP_LANDING_CONFIG[slug];
}

export function icpLandingCtaHref(
  base: '/signup' | '/book-demo' | '/demo',
  slug: IcpLandingSlug,
  demoSlug?: string,
): string {
  const config = ICP_LANDING_CONFIG[slug];
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'icp',
    utm_campaign: config.utmCampaign,
  });

  if (base === '/signup') {
    params.set('redirect', `/demo/${demoSlug ?? config.demoSlug}`);
  }

  if (base === '/demo') {
    return `/demo/${demoSlug ?? config.demoSlug}?${params.toString()}`;
  }

  return `${base}?${params.toString()}`;
}
