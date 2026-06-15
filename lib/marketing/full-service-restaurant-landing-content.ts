import type { RichSolutionLanding } from '@/lib/marketing/solution-landing-content';
import { RICH_SOLUTION_LANDING } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';
import { SOLUTION_SEGMENT_META } from '@/lib/marketing/solution-segment-meta';

export const FULL_SERVICE_RESTAURANT_PATH = '/landing/full-service-restaurant' as const;

export const FULL_SERVICE_RESTAURANT_META = {
  title: 'Full-Service Restaurant POS & Kitchen Software | OS Kitchen',
  description:
    'Table management, QR ordering, kitchen display, and bill splitting on tablets you already own. 14-day free trial — no proprietary hardware.',
  keywords: [
    'full service restaurant pos',
    'restaurant table management software',
    'restaurant kds',
    'qr table ordering restaurant',
    'restaurant bill splitting pos',
  ],
  utmCampaign: 'icp_full_service_restaurant',
  demoSlug: 'restaurant',
} as const;

export const FULL_SERVICE_PAIN_POINTS = [
  {
    title: 'Floor and kitchen run on different clocks',
    description:
      'Paper tickets, shouted mods, and a POS that does not talk to expo — so entrees fire late and managers play telephone during peak.',
  },
  {
    title: 'Table turns slow down when tabs are messy',
    description:
      'Split checks, transferred tables, and walk-ins stacked on one busy Saturday — without a shared floor plan, servers lose minutes every round.',
  },
  {
    title: 'Hardware bundles lock you in before you are ready',
    description:
      'Legacy POS vendors push proprietary terminals and opaque processing — hard to trial new workflows on the iPads you already own.',
  },
] as const;

export const FULL_SERVICE_SOLUTION = {
  title: 'One operations OS from table to ticket to tab close',
  description:
    'OS Kitchen connects table assignment, handheld and counter POS, QR guest ordering, kitchen display, and bill splitting in a single web workspace — no terminal lease required.',
  bullets: [
    'Visual floor plan with live table status',
    'Orders route to KDS the moment they are fired',
    'Guests scan QR codes — no app download',
    'Split bills and close tabs from the same POS session',
  ],
} as const;

export const FULL_SERVICE_FEATURE_HIGHLIGHTS = [
  {
    title: 'Table management',
    description:
      'Drag-and-drop floor plan. Mark tables Available, Occupied, Reserved, or Dirty. Assign every open order to a table so servers and expo share one truth.',
    screenshotLabel: 'Floor plan & table status',
  },
  {
    title: 'QR table ordering',
    description:
      'Print QR codes per table. Guests browse your menu on their phone and submit orders that land on the same KDS as staff-entered tickets.',
    screenshotLabel: 'Guest QR menu',
  },
  {
    title: 'Kitchen Display System',
    description:
      'Color-coded tickets, sound alerts, and bump-to-clear workflow. Replace paper chits without buying a separate KDS bundle.',
    screenshotLabel: 'Kitchen display tickets',
  },
  {
    title: 'Bill splitting',
    description:
      'Split checks by seat or item before close. Open tabs per table, add rounds through service, and finalize with tip — one click from handheld or counter POS.',
    screenshotLabel: 'Split bill & tab close',
  },
] as const;

export const FULL_SERVICE_SCREENSHOTS = [
  {
    id: 'floor-plan',
    title: 'Floor plan',
    caption: 'Table status and order assignment during Friday dinner service.',
  },
  {
    id: 'kds',
    title: 'Kitchen display',
    caption: 'Expo bumps tickets when plates hit the pass — synced to Order Hub.',
  },
  {
    id: 'pos-tabs',
    title: 'POS & open tabs',
    caption: 'Counter and handheld POS with tab management and split checkout.',
  },
] as const;

export const FULL_SERVICE_TESTIMONIAL_PLACEHOLDER = {
  quote:
    'We moved floor service and kitchen display onto one system without buying new terminals — peak nights feel calmer because tickets are not getting lost between the dining room and the pass.',
  name: 'Pilot operator — name withheld',
  role: 'GM, full-service restaurant (design partner cohort)',
  disclaimer: 'Illustrative placeholder — not a verified customer quote. Real case studies publish at /customers when available.',
} as const;

export const FULL_SERVICE_LIMITATIONS = [
  'POS and KDS require network connectivity — offline sale finalization is not supported today.',
  'Full split-bill UI continues to roll out — schema-ready split tracking exists; confirm scope for your venue before go-live.',
  'Stripe Terminal is optional for card-present — configure in your workspace when ready.',
  'Marketplace delivery adapters remain partner-gated until your credentials are verified live.',
] as const;

export function getFullServiceRestaurantContent(): RichSolutionLanding {
  return RICH_SOLUTION_LANDING.restaurants;
}

export function getFullServiceRestaurantSegmentMeta(): SolutionSegmentMeta {
  return SOLUTION_SEGMENT_META.restaurants;
}

export function fullServiceRestaurantCtaHref(
  base: '/signup' | '/book-demo' | '/demo' | '/pricing',
): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'icp',
    utm_campaign: FULL_SERVICE_RESTAURANT_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', `/demo/${FULL_SERVICE_RESTAURANT_META.demoSlug}`);
  }
  if (base === '/demo') {
    return `/demo/${FULL_SERVICE_RESTAURANT_META.demoSlug}?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}
