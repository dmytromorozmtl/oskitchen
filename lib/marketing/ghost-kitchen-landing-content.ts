import type { RichSolutionLanding } from '@/lib/marketing/solution-landing-content';
import { RICH_SOLUTION_LANDING } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';
import { SOLUTION_SEGMENT_META } from '@/lib/marketing/solution-segment-meta';

export const GHOST_KITCHEN_LANDING_PATH = '/ghost-kitchen-software' as const;

export const GHOST_KITCHEN_LANDING_META = {
  title: 'Ghost Kitchen Software — Multi-Brand Order Hub | OS Kitchen',
  description:
    'Run virtual brands from one kitchen — unified order hub, marketplace purchasing, AI purchasing suggestions, production board, and profit per brand. 14-day free trial.',
  keywords: [
    'ghost kitchen software',
    'virtual brand kitchen',
    'multi-brand restaurant software',
    'cloud kitchen order management',
    'ghost kitchen marketplace',
  ],
  utmCampaign: 'icp_ghost_kitchen',
  demoSlug: 'ghost-kitchen',
} as const;

export const GHOST_KITCHEN_PAIN_POINTS = [
  {
    title: 'Every brand has its own tablet',
    description:
      'Uber, DoorDash, Shopify, and a fourth virtual brand each ping a different screen — expo never sees one prioritized queue.',
  },
  {
    title: 'Purchasing is blind to what sold',
    description:
      'Commissary buyers reorder from habit while brand-level demand shifts weekly — margin leaks before anyone opens a spreadsheet.',
  },
  {
    title: 'No honest P&L per virtual brand',
    description:
      'Revenue rolls up in payment processor reports, but labor, food cost, and channel fees stay blended — you cannot kill the weak brand fast enough.',
  },
] as const;

export const GHOST_KITCHEN_SOLUTION = {
  title: 'One kitchen OS for every virtual brand',
  description:
    'OS Kitchen normalizes delivery, web, and marketplace orders into a single Order Hub, routes shared production, surfaces AI purchasing suggestions, and shows profit snapshots per brand — with honest BETA labels where integrations are still maturing.',
  bullets: [
    'Order Hub — one prioritized queue with channel and brand labels',
    'HoReCa B2B marketplace for supplier catalogs and PO workflow (BETA)',
    'AI Purchasing suggestions from demand signals — buyer approves POs',
    'Production board batches prep across brands sharing stations',
    'Brand P&L snapshot — see which virtual brand earns its shelf space',
  ],
} as const;

export const GHOST_KITCHEN_FEATURE_HIGHLIGHTS = [
  {
    title: 'Unified Order Hub',
    description:
      'WooCommerce, Shopify, manual, and marketplace adapters (when configured) normalize into one operator queue — filter by brand, channel, or fulfillment type.',
    screenshotLabel: 'Multi-brand order hub',
  },
  {
    title: 'HoReCa marketplace',
    description:
      'Browse approved vendor catalogs, build carts, and create purchase orders inside your workspace. Marketplace is BETA — design-partner vendors onboarding on staging.',
    screenshotLabel: 'Marketplace catalog',
  },
  {
    title: 'AI Purchasing',
    description:
      'Demand-aware purchasing suggestions roll ingredient needs from orders and recipes. Operators approve POs — not autopilot procurement.',
    screenshotLabel: 'AI purchasing suggestions',
  },
  {
    title: 'Production board',
    description:
      'Batch prep across virtual brands that share proteins, sauces, and fryers. Yield-aware quantities when recipes are configured.',
    screenshotLabel: 'Cross-brand production',
  },
  {
    title: 'Profit per brand',
    description:
      'Multi-brand command center with revenue snapshots and brand-level performance views — directional P&L, not audited financial statements.',
    screenshotLabel: 'Brand P&L snapshot',
  },
] as const;

export const GHOST_KITCHEN_SCREENSHOTS = [
  {
    id: 'order-hub',
    title: 'Order Hub',
    caption: 'Delivery, web, and POS tickets in one queue with brand filters.',
  },
  {
    id: 'production',
    title: 'Production board',
    caption: 'Shared prep batches across virtual brands before the dinner rush.',
  },
  {
    id: 'brand-pnl',
    title: 'Profit per brand',
    caption: 'Compare virtual brand performance without exporting spreadsheets.',
  },
] as const;

export const GHOST_KITCHEN_TESTIMONIAL_PLACEHOLDER = {
  quote:
    'We finally stopped toggling between four delivery tablets — the kitchen sees one ticket stream and we can tell which virtual brand is actually worth the shelf space.',
  name: 'Pilot operator — name withheld',
  role: 'Operator, multi-brand ghost kitchen (design partner cohort)',
  disclaimer:
    'Illustrative placeholder — not a verified customer quote. Real case studies publish at /customers when available.',
} as const;

export const GHOST_KITCHEN_LIMITATIONS = [
  'Marketplace delivery adapters (Uber Eats, DoorDash, Grubhub) require partner credentials — shown as NEEDS_AUTH until verified live.',
  'HoReCa B2B marketplace is BETA — not a live national supplier network yet.',
  'AI Purchasing is BETA — suggestions require buyer approval; not unattended ordering.',
  'Brand P&L snapshots are operational views — not audited accounting or tax reporting.',
] as const;

export function getGhostKitchenLandingContent(): RichSolutionLanding {
  return RICH_SOLUTION_LANDING['ghost-kitchens'];
}

export function getGhostKitchenSegmentMeta(): SolutionSegmentMeta {
  return SOLUTION_SEGMENT_META['ghost-kitchens'];
}

export function ghostKitchenCtaHref(base: '/signup' | '/book-demo' | '/demo' | '/pricing'): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'icp',
    utm_campaign: GHOST_KITCHEN_LANDING_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', `/demo/${GHOST_KITCHEN_LANDING_META.demoSlug}`);
  }
  if (base === '/demo') {
    return `/demo/${GHOST_KITCHEN_LANDING_META.demoSlug}?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}
