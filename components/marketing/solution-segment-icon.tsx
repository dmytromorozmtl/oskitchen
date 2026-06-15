'use client';

import type { LucideIcon } from 'lucide-react';
import { Cake, Coffee, Ghost, Package, Salad, Truck, UtensilsCrossed, Wine } from 'lucide-react';

import type { RichSolutionSlug } from '@/lib/marketing/solution-landing-content';

const ICONS: Record<RichSolutionSlug, LucideIcon> = {
  restaurants: UtensilsCrossed,
  bars: Wine,
  cafes: Coffee,
  'fast-casual': Salad,
  'ghost-kitchens': Ghost,
  'meal-prep': Package,
  catering: Truck,
  bakeries: Cake,
};

export function SolutionSegmentIcon({ slug }: { slug: RichSolutionSlug }) {
  const Icon = ICONS[slug];
  return <Icon className="h-7 w-7 text-primary" aria-hidden />;
}
