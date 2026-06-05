import type { RichSolutionLanding } from '@/lib/marketing/solution-landing-content';
import { RICH_SOLUTION_LANDING } from '@/lib/marketing/solution-landing-content';
import type { SolutionSegmentMeta } from '@/lib/marketing/solution-segment-meta';
import { SOLUTION_SEGMENT_META } from '@/lib/marketing/solution-segment-meta';

export const BAR_LANDING_PATH = '/landing/bar' as const;

export const BAR_LANDING_META = {
  title: 'Bar & Nightclub POS — Tabs, Speed Mode, Voice Ordering | OS Kitchen',
  description:
    'Bar POS with tab management, speed-mode pours, inventory per pour, voice ordering, and dark mode UI for nightlife — 14-day free trial on iPads you already own.',
  keywords: [
    'bar pos software',
    'nightclub pos system',
    'bar tab management',
    'pour cost inventory bar',
    'voice ordering restaurant',
    'bar pos dark mode',
  ],
  utmCampaign: 'icp_bar',
  demoSlug: 'bar',
} as const;

export const BAR_PAIN_POINTS = [
  {
    title: 'Tabs pile up while the rail stays backed up',
    description:
      'Bartenders open tabs on paper, re-ring drinks in the POS, and lose track of transfers — closeout takes longer than last call.',
  },
  {
    title: 'Pour cost is a guess until inventory counts',
    description:
      'Premium bottles deplete faster than sales suggest — without per-pour tracking, shrink shows up weeks later in a manual count.',
  },
  {
    title: 'Bright POS screens blind staff on a dark floor',
    description:
      'Generic POS UIs glare on a nightclub floor and slow bartenders who need speed-mode buttons, not nested menus, during peak hours.',
  },
] as const;

export const BAR_SOLUTION = {
  title: 'Fast tabs, honest pours, and a UI built for low light',
  description:
    'OS Kitchen gives bars and nightclubs speed-mode drink buttons, open tab workflows, inventory depletion per pour when recipes are configured, hands-free voice ordering hooks, and a dark-mode dashboard that matches your floor — no proprietary terminal lease.',
  bullets: [
    'Open tabs by table or name — add rounds with one-tap speed mode',
    'Inventory tracks depletion per pour when recipes and bottle SKUs exist',
    'Voice ordering webhook for hands-busy service (configure in Settings → Voice)',
    'Dark mode UI across POS, tabs, and kitchen display for nightlife venues',
  ],
} as const;

export const BAR_FEATURE_HIGHLIGHTS = [
  {
    title: 'Tab management',
    description:
      'Open tabs by table or customer name. Add drinks and food all night, transfer tables, and close with tip in one step from handheld or rail POS.',
    screenshotLabel: 'Open tabs',
  },
  {
    title: 'Speed mode POS',
    description:
      'Pin beer, wine, cocktails, and shots to a quick-order grid. Bartenders tap once to add to the active tab — built for Friday night volume.',
    screenshotLabel: 'Speed mode rail',
  },
  {
    title: 'Inventory per pour',
    description:
      'Link menu items to recipes and bottle SKUs so each sale depletes inventory by pour cost — catch variance before the month-end count.',
    screenshotLabel: 'Pour cost tracking',
  },
  {
    title: 'Voice ordering',
    description:
      'Enable voice webhooks in workspace settings so staff can fire common orders hands-free when the rail is three deep — same pipeline as kitchen voice.',
    screenshotLabel: 'Voice order intent',
  },
  {
    title: 'Dark mode UI',
    description:
      'Theme-aware POS and dashboard surfaces use dark mode consistently — easier on eyes for bartenders, expo, and managers on a dim floor.',
    screenshotLabel: 'Nightlife dark theme',
  },
] as const;

export const BAR_SCREENSHOTS = [
  {
    id: 'tabs',
    title: 'Tab management',
    caption: 'Multiple open tabs with quick-order drink buttons on the rail.',
  },
  {
    id: 'speed-mode',
    title: 'Speed mode',
    caption: 'One-tap cocktails, beer, and shots during peak service.',
  },
  {
    id: 'dark-ui',
    title: 'Dark mode POS',
    caption: 'Low-glare interface for nightclub and late-night bar floors.',
  },
] as const;

export const BAR_TESTIMONIAL_PLACEHOLDER = {
  quote:
    'Speed mode and dark UI finally match how our bartenders actually work — tabs stay open all night without the blinding white screen from our old POS.',
  name: 'Pilot operator — name withheld',
  role: 'Bar manager, cocktail bar & late-night venue (design partner cohort)',
  disclaimer:
    'Illustrative placeholder — not a verified customer quote. Real case studies publish at /customers when available.',
} as const;

export const BAR_LIMITATIONS = [
  'Full split-bill UI continues to roll out — split tracking exists in the data model today.',
  'Per-pour inventory depletion requires recipes and bottle SKUs configured in your workspace.',
  'Voice ordering requires webhook setup and supported client — not universal on all devices.',
  'Stripe Terminal is optional for card-present — cash and external terminals supported per pilot scope.',
] as const;

export function getBarLandingContent(): RichSolutionLanding {
  return RICH_SOLUTION_LANDING.bars;
}

export function getBarSegmentMeta(): SolutionSegmentMeta {
  return SOLUTION_SEGMENT_META.bars;
}

export function barCtaHref(base: '/signup' | '/book-demo' | '/demo' | '/pricing'): string {
  const params = new URLSearchParams({
    utm_source: 'landing',
    utm_medium: 'icp',
    utm_campaign: BAR_LANDING_META.utmCampaign,
  });
  if (base === '/signup') {
    params.set('redirect', `/demo/${BAR_LANDING_META.demoSlug}`);
  }
  if (base === '/demo') {
    return `/demo/${BAR_LANDING_META.demoSlug}?${params.toString()}`;
  }
  return `${base}?${params.toString()}`;
}
