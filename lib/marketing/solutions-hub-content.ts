import type { SolutionPageSlug } from '@/lib/demo-verticals';

export type SolutionsHubCard = {
  slug: SolutionPageSlug;
  title: string;
  description: string;
  emoji: string;
  href: string;
};

/** Primary solution pages — featured on /solutions hub and nav. */
export const SOLUTIONS_HUB_PRIMARY: SolutionsHubCard[] = [
  {
    slug: 'restaurants',
    title: 'Restaurants',
    description: 'POS, tables, QR ordering, and kitchen display for full-service dining.',
    emoji: '🍽️',
    href: '/solutions/restaurants',
  },
  {
    slug: 'bars',
    title: 'Bars & nightlife',
    description: 'Tabs, quick-order drinks, splits, and kitchen sync.',
    emoji: '🍸',
    href: '/solutions/bars',
  },
  {
    slug: 'cafes',
    title: 'Cafés',
    description: 'Counter POS, order-ahead, and pastry kitchen routing.',
    emoji: '☕',
    href: '/solutions/cafes',
  },
  {
    slug: 'fast-casual',
    title: 'Fast-casual',
    description: 'High-throughput POS, KDS, and production for lunch rush.',
    emoji: '🍔',
    href: '/solutions/fast-casual',
  },
  {
    slug: 'meal-prep',
    title: 'Meal prep',
    description: 'Weekly menus, preorder cutoffs, production, and packing.',
    emoji: '🥗',
    href: '/meal-prep-software',
  },
  {
    slug: 'catering',
    title: 'Catering',
    description: 'Events, production plans, packing, and delivery handoff.',
    emoji: '🍱',
    href: '/catering-management',
  },
  {
    slug: 'bakeries',
    title: 'Bakeries',
    description: 'Preorders, bake schedules, pickup waves, and counter POS.',
    emoji: '🥐',
    href: '/solutions/bakeries',
  },
  {
    slug: 'ghost-kitchens',
    title: 'Ghost kitchens',
    description: 'Multi-brand command center and channel imports.',
    emoji: '👻',
    href: '/ghost-kitchen-software',
  },
  {
    slug: 'commissary',
    title: 'Commissary',
    description: 'Multi-tenant production, packing, and B2B supply (BETA).',
    emoji: '🏭',
    href: '/commissary-software',
  },
];

export const SOLUTIONS_HUB_COPY = {
  metaTitle: 'Solutions — POS & Kitchen Operations by Business Type | OS Kitchen',
  metaDescription:
    'Restaurant POS, meal prep software, catering management, bakery orders, bars, cafés, and ghost kitchens — one platform. Compare solutions and start a 14-day trial.',
  headline: 'Built for multi-concept operators',
  subheadline:
    'Whether you run ghost kitchens, meal prep, commissary production, or event catering — OS Kitchen connects orders, kitchen, and fulfillment without hardware lock-in.',
  primaryCta: { label: 'Start free trial', href: '/signup' },
  secondaryCta: { label: 'Compare pricing', href: '/pricing' },
} as const;
