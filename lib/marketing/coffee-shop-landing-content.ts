import type { RichSolutionLanding } from '@/lib/marketing/solution-landing-content';
import { RICH_SOLUTION_LANDING } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';
import { SOLUTION_SEGMENT_META } from '@/lib/marketing/solution-segment-meta';

export const COFFEE_SHOP_LANDING_PATH = '/landing/coffee-shop' as const;

export const COFFEE_SHOP_LANDING_META = {
  title: 'Coffee Shop & Bakery POS Software | OS Kitchen',
  description:
    'Speed-mode POS for morning rush, production calendar for bakes, QR pickup ordering, and punch-card loyalty — 14-day free trial on tablets you already own.',
  keywords: [
    'coffee shop pos software',
    'bakery pos system',
    'cafe order ahead',
    'coffee shop loyalty program',
    'bakery production schedule',
    'qr ordering coffee shop',
  ],
  utmCampaign: 'icp_coffee_shop',
  demoSlug: 'cafe',
} as const;

export const COFFEE_SHOP_PAIN_POINTS = [
  {
    title: 'The 7 AM line moves faster than your POS',
    description:
      'Repeat drinks, modifiers, and pastry add-ons stack up while baristas tap through nested menus — and the back oven has no idea what sold at the counter.',
  },
  {
    title: 'Preorders and walk-ins fight for the same bench',
    description:
      'Mobile order pickups, wholesale croissant trays, and counter impulse buys all need bake timing — but spreadsheets do not update when the rush hits.',
  },
  {
    title: 'Loyalty lives on paper punch cards',
    description:
      'Regulars ask for their free tenth coffee while staff hunt for stamps — no link between CRM, POS, and the promotion you actually run.',
  },
] as const;

export const COFFEE_SHOP_SOLUTION = {
  title: 'Counter speed, bake planning, and loyalty in one queue',
  description:
    'OS Kitchen gives cafés and bakeries speed-mode POS for rush hour, a production calendar for oven timing, QR order-ahead, and configurable punch-card rewards — without a proprietary terminal lease.',
  bullets: [
    'One-tap speed mode for espresso, tea, and pastry bestsellers',
    'Production calendar aligns bake batches with preorders and counter demand',
    'QR ordering for pickup — same queue as register tickets',
    'Punch-card loyalty — e.g. 10th coffee free when configured in your workspace',
  ],
} as const;

export const COFFEE_SHOP_FEATURE_HIGHLIGHTS = [
  {
    title: 'Speed mode POS',
    description:
      'Pin your top drinks and pastries to a quick-order grid. Baristas tap once to add — modifiers stay one screen away for rush throughput.',
    screenshotLabel: 'Speed mode register',
  },
  {
    title: 'Production calendar',
    description:
      'Schedule bake batches, dough prep, and pickup waves on a production calendar so the bench knows what to pull before the morning line peaks.',
    screenshotLabel: 'Bake day calendar',
  },
  {
    title: '10th coffee free loyalty',
    description:
      'Configure punch-card style rewards in workspace settings — track stamps per customer and auto-apply free items at checkout when thresholds hit.',
    screenshotLabel: 'Punch-card loyalty',
  },
  {
    title: 'QR pickup ordering',
    description:
      'Guests scan a counter QR, order ahead, and pick up without waiting in line. Tickets merge with counter POS in Order Hub.',
    screenshotLabel: 'QR order-ahead',
  },
] as const;

export const COFFEE_SHOP_SCREENSHOTS = [
  {
    id: 'speed-pos',
    title: 'Speed mode POS',
    caption: 'One-tap espresso, lattes, and pastry buttons during morning rush.',
  },
  {
    id: 'production-calendar',
    title: 'Production calendar',
    caption: 'Bake batches and pickup windows aligned to confirmed demand.',
  },
  {
    id: 'qr-pickup',
    title: 'QR order-ahead',
    caption: 'Mobile pickup orders in the same queue as counter sales.',
  },
] as const;

export const COFFEE_SHOP_TESTIMONIAL_PLACEHOLDER = {
  quote:
    'We stopped losing mobile pickup orders in a separate tablet app — the counter and the oven see the same list before the morning rush peaks.',
  name: 'Pilot operator — name withheld',
  role: 'Owner, neighborhood café & bakery (design partner cohort)',
  disclaimer:
    'Illustrative placeholder — not a verified customer quote. Real case studies publish at /customers when available.',
} as const;

export const COFFEE_SHOP_LIMITATIONS = [
  'Dedicated self-service kiosk UI is on the roadmap — QR ordering and counter POS are live today.',
  'Advanced loyalty campaigns beyond punch-card/points modes continue to roll out — confirm scope in trial.',
  'Production calendar depth depends on recipes and menus configured in your workspace.',
  'Stripe Connect required for hosted storefront checkout and card-present when enabled.',
] as const;

export function getCoffeeShopLandingContent(): RichSolutionLanding {
  return RICH_SOLUTION_LANDING.cafes;
}

export function getCoffeeShopSegmentMeta(): SolutionSegmentMeta {
  return SOLUTION_SEGMENT_META.cafes;
}

export function coffeeShopCtaHref(base: '/signup' | '/book-demo' | '/demo' | '/pricing'): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'icp',
    utm_campaign: COFFEE_SHOP_LANDING_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', `/demo/${COFFEE_SHOP_LANDING_META.demoSlug}`);
  }
  if (base === '/demo') {
    return `/demo/${COFFEE_SHOP_LANDING_META.demoSlug}?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}
