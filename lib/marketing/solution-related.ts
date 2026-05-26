import type { SolutionPageSlug } from '@/lib/demo-verticals';
import type { RelatedPage } from '@/components/marketing/related-pages';

export function relatedPagesForSolution(slug: SolutionPageSlug): RelatedPage[] {
  const all: RelatedPage[] = [
    { title: 'Restaurants', href: '/solutions/restaurants', description: 'Table management, KDS, QR ordering' },
    { title: 'Bars', href: '/solutions/bars', description: 'Tabs, quick-order drinks, split bills' },
    { title: 'Cafés', href: '/solutions/cafes', description: 'Quick POS, QR, order-ahead' },
    { title: 'Fast-casual', href: '/solutions/fast-casual', description: 'High-throughput POS & KDS' },
    { title: 'Ghost kitchens', href: '/solutions/ghost-kitchens', description: 'Multi-brand command center' },
    { title: 'Meal prep', href: '/solutions/meal-prep', description: 'Weekly menus & production' },
    { title: 'Pricing', href: '/pricing', description: 'Plans from $29/mo · 14-day trial' },
    { title: 'Interactive demo', href: '/demo', description: 'Try a live workspace' },
    { title: 'Blog', href: '/blog', description: 'Guides for operators' },
    {
      title: 'Meal prep order queue',
      href: '/blog/meal-prep-order-queue-cut-packing-errors',
      description: 'Cut packing errors with one production queue',
    },
  ];

  return all.filter((p) => !p.href.endsWith(`/${slug}`)).slice(0, 6);
}
