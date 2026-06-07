import type { RichSolutionLanding } from '@/lib/marketing/solution-landing-content';
import { RICH_SOLUTION_LANDING } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';
import { SOLUTION_SEGMENT_META } from '@/lib/marketing/solution-segment-meta';

export const MEAL_PREP_SOFTWARE_LANDING_PATH = '/meal-prep-software' as const;

export const MEAL_PREP_SOFTWARE_LANDING_META = {
  title: 'Meal Prep Software — Weekly Production & Packing | OS Kitchen',
  description:
    'Meal prep software for weekly menus, preorder cutoffs, production board, and packing labels. Replace Sunday spreadsheets. 14-day free trial from $29/mo.',
  keywords: [
    'meal prep software',
    'meal prep business software',
    'weekly meal prep operations',
    'meal subscription kitchen',
    'meal prep order management',
  ],
  utmCampaign: 'meal_prep_software_seo',
  demoSlug: 'meal-prep',
} as const;

export const MEAL_PREP_SOFTWARE_PAIN_POINTS = [
  {
    title: 'Sunday spreadsheet reconciliation',
    description:
      'Shopify, Woo, and walk-in orders export to different tabs — production quantities are wrong before the first tray hits the oven.',
  },
  {
    title: 'Cutoff chaos',
    description:
      'Customers order after the kitchen locked the menu, or ops forget to close the storefront — batch sizes shift mid-prep.',
  },
  {
    title: 'Packing mistakes at handoff',
    description:
      'Lane sheets are handwritten or missing dietary flags — mispacks erode trust during pickup and delivery windows.',
  },
] as const;

export const MEAL_PREP_SOFTWARE_SOLUTION = {
  title: 'One system from weekly menu to packed handoff',
  description:
    'OS Kitchen connects preorder cutoffs, confirmed order quantities, production board batches, and packing labels — with honest BETA labels on subscription bridge and live marketplace ops.',
  bullets: [
    'Weekly menu + storefront with cutoff enforcement when configured',
    'Order hub — storefront, manual, and channel imports in one queue',
    'Production board — batch quantities from confirmed orders',
    'Packing sheets grouped by pickup lane or customer',
    'Meal Prep OS dashboard — menus, cutoffs, forecasting KPIs (BETA)',
  ],
} as const;

export const MEAL_PREP_SOFTWARE_FEATURE_HIGHLIGHTS = [
  {
    title: 'Weekly menu publishing',
    description:
      'Lock preorder deadlines and prepared dates so production day reflects what customers actually bought.',
    screenshotLabel: 'Weekly menu',
  },
  {
    title: 'Production board',
    description:
      'Batch prep by SKU with yield factors when recipes exist — see quantities before turning on ovens.',
    screenshotLabel: 'Production board',
  },
  {
    title: 'Packing & labels',
    description:
      'Lane-based packing sheets reduce mispacks during pickup and delivery handoff.',
    screenshotLabel: 'Packing lanes',
  },
  {
    title: 'Storefront preorders',
    description:
      'Hosted checkout with Stripe when configured — customers order online; kitchen runs one queue.',
    screenshotLabel: 'Storefront checkout',
  },
  {
    title: 'Ingredient demand',
    description:
      'Roll up recipe needs from confirmed orders — foundation for purchasing, not a full ERP replacement.',
    screenshotLabel: 'Ingredient rollup',
  },
] as const;

export const MEAL_PREP_SOFTWARE_SCREENSHOTS = [
  {
    id: 'menu-cutoff',
    title: 'Menu & cutoff',
    caption: 'Publish weekly menus and enforce preorder deadlines.',
  },
  {
    id: 'production',
    title: 'Production board',
    caption: 'Batch quantities from confirmed orders — not guesses.',
  },
  {
    id: 'packing',
    title: 'Packing lanes',
    caption: 'Group by pickup window before handoff.',
  },
] as const;

export const MEAL_PREP_SOFTWARE_TESTIMONIAL_PLACEHOLDER = {
  quote:
    'We stopped arguing about what to cook. The board shows what sold before we turn on the ovens.',
  name: 'Pilot operator — name withheld',
  role: 'Owner-operator, weekly meal prep (design partner cohort)',
  disclaimer:
    'Illustrative placeholder — not a verified customer quote. Real case studies publish at /customers when available.',
} as const;

export const MEAL_PREP_SOFTWARE_LIMITATIONS = [
  'Stripe storefront checkout requires Stripe Connect configuration in your workspace.',
  'Native meal-plan subscriptions are BETA — WooCommerce Subscriptions bridge is read-only placeholder.',
  'Marketplace delivery live ops (DoorDash/Uber) are SKIPPED — partner-gated.',
  'Ingredient demand rollups need recipes configured — not full ERP automation.',
  'AI Purchasing suggestions are BETA — buyer approves POs; not autopilot procurement.',
] as const;

export function getMealPrepSoftwareLandingContent(): RichSolutionLanding {
  return RICH_SOLUTION_LANDING['meal-prep'];
}

export function getMealPrepSoftwareSegmentMeta(): SolutionSegmentMeta {
  return SOLUTION_SEGMENT_META['meal-prep'];
}

export function mealPrepSoftwareCtaHref(
  base: '/signup' | '/book-demo' | '/demo' | '/pricing',
): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'seo',
    utm_campaign: MEAL_PREP_SOFTWARE_LANDING_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', `/demo/${MEAL_PREP_SOFTWARE_LANDING_META.demoSlug}`);
  }
  if (base === '/demo') {
    return `/demo/${MEAL_PREP_SOFTWARE_LANDING_META.demoSlug}?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}
