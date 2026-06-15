import type { Metadata } from 'next';

import {
  DEMO_VERTICAL_SLUGS,
  getDemoWorkspacePreset,
  type DemoVerticalSlug,
} from '@/lib/demo-verticals';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

const SLUG_LABELS: Record<DemoVerticalSlug, string> = {
  'meal-prep': 'Meal prep',
  catering: 'Catering',
  'ghost-kitchen': 'Ghost kitchen',
  bakery: 'Bakery',
  restaurant: 'Restaurant',
  cafe: 'Café',
  bar: 'Bar',
};

export function demoVerticalMetadata(slug: DemoVerticalSlug): Metadata {
  const preset = getDemoWorkspacePreset(slug);
  const label = SLUG_LABELS[slug];

  return marketingPageMetadata({
    title: `${label} Demo Workspace — OS Kitchen`,
    description: `${preset.tagline} Load simulated menus, orders, and channels — no live marketplace claims.`,
    path: `/demo/${slug}`,
    keywords: [`${label.toLowerCase()} kitchen software demo`, 'restaurant POS trial data'],
  });
}

export function isDemoVerticalSlug(raw: string): raw is DemoVerticalSlug {
  return DEMO_VERTICAL_SLUGS.includes(raw as DemoVerticalSlug);
}
