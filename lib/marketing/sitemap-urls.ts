import { DEMO_VERTICAL_SLUGS } from '@/lib/demo-verticals';
import { PRODUCT_MARKETING_SLUGS } from '@/lib/product-marketing';
import type { IntegrationSlug } from '@/lib/marketing/integration-seo';
import { COMPARE_SLUGS } from '@/lib/marketing/compare-content';
import { GEO_CITIES } from '@/lib/marketing/geo-cities';
import { CASE_STUDIES } from '@/lib/marketing/case-studies';
import { integrationPages } from '@/lib/public-copy';

/** Marketing URLs for sitemap — keep in sync with public routes. */
export function marketingSitemapPaths(): Array<{
  path: string;
  priority: number;
  changeFrequency: 'weekly' | 'monthly' | 'yearly';
}> {
  const integrationPaths = (Object.keys(integrationPages) as IntegrationSlug[]).map((slug) => ({
    path: `/integrations/${slug}`,
    priority: 0.65,
    changeFrequency: 'monthly' as const,
  }));

  const productPaths = PRODUCT_MARKETING_SLUGS.map((slug) => ({
    path: `/product/${slug}`,
    priority: 0.7,
    changeFrequency: 'monthly' as const,
  }));

  const demoPaths = DEMO_VERTICAL_SLUGS.map((slug) => ({
    path: `/demo/${slug}`,
    priority: 0.65,
    changeFrequency: 'monthly' as const,
  }));

  return [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/product', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/product/pos-terminal', priority: 0.75, changeFrequency: 'monthly' },
    ...productPaths,
    { path: '/pricing', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/get-started', priority: 0.88, changeFrequency: 'monthly' },
    { path: '/compare', priority: 0.8, changeFrequency: 'monthly' },
    ...COMPARE_SLUGS.map((slug) => ({
      path: `/compare/${slug}`,
      priority: 0.75,
      changeFrequency: 'monthly' as const,
    })),
    { path: '/deck', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/roi-calculator', priority: 0.72, changeFrequency: 'monthly' },
    { path: '/capabilities', priority: 0.75, changeFrequency: 'monthly' },
    { path: '/demo', priority: 0.8, changeFrequency: 'monthly' },
    ...demoPaths,
    { path: '/book-demo', priority: 0.78, changeFrequency: 'monthly' },
    { path: '/integrations', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/integrations/woocommerce/extension', priority: 0.55, changeFrequency: 'monthly' },
    ...integrationPaths,
    { path: '/solutions', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/solutions/meal-prep', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/landing/meal-prep', priority: 0.84, changeFrequency: 'monthly' },
    { path: '/meal-prep-software', priority: 0.86, changeFrequency: 'monthly' },
    { path: '/ghost-kitchen-software', priority: 0.86, changeFrequency: 'monthly' },
    { path: '/commissary-software', priority: 0.86, changeFrequency: 'monthly' },
    { path: '/toast-alternative', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/square-alternative', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/marketman-alternative', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/marginedge-alternative', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/restaurant365-alternative', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/landing/full-service-restaurant', priority: 0.84, changeFrequency: 'monthly' },
    { path: '/landing/coffee-shop', priority: 0.84, changeFrequency: 'monthly' },
    { path: '/landing/bar', priority: 0.84, changeFrequency: 'monthly' },
    { path: '/landing/weekly-preorder', priority: 0.84, changeFrequency: 'monthly' },
    { path: '/solutions/catering', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/solutions/bakeries', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/solutions/restaurants', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/solutions/bars', priority: 0.88, changeFrequency: 'monthly' },
    { path: '/solutions/cafes', priority: 0.88, changeFrequency: 'monthly' },
    { path: '/solutions/fast-casual', priority: 0.88, changeFrequency: 'monthly' },
    { path: '/solutions/ghost-kitchens', priority: 0.88, changeFrequency: 'monthly' },
    { path: '/blog', priority: 0.75, changeFrequency: 'weekly' },
    {
      path: '/blog/meal-prep-order-queue-cut-packing-errors',
      priority: 0.72,
      changeFrequency: 'monthly',
    },
    { path: '/blog/how-to-start-meal-prep-business', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/blog/restaurant-pos-comparison-2026', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/blog/reduce-food-waste-with-production-planning', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/blog/how-to-choose-restaurant-pos-2026', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/blog/ghost-kitchen-setup-complete-guide', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/blog/commissary-kitchen-software-guide', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/resources', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/resources/restaurant-financing', priority: 0.65, changeFrequency: 'monthly' },
    { path: '/support', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/trust', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/partners', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/customers', priority: 0.75, changeFrequency: 'monthly' },
    { path: '/customers/meal-prep-weekly', priority: 0.65, changeFrequency: 'monthly' },
    { path: '/customers/restaurant-floor-kds', priority: 0.65, changeFrequency: 'monthly' },
    { path: '/customers/ghost-multi-brand', priority: 0.65, changeFrequency: 'monthly' },
    { path: '/service-areas', priority: 0.65, changeFrequency: 'monthly' },
    ...GEO_CITIES.map((city) => ({
      path: `/locations/${city.slug}`,
      priority: 0.68,
      changeFrequency: 'monthly' as const,
    })),
    { path: '/case-studies/pilot-meal-prep-q3', priority: 0.6, changeFrequency: 'monthly' },
    ...CASE_STUDIES.map((s) => ({
      path: `/case-studies/${s.slug}`,
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    })),
    { path: '/contact-sales', priority: 0.55, changeFrequency: 'monthly' },
    { path: '/legal/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/security', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/dpa', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/cookie-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/acceptable-use', priority: 0.3, changeFrequency: 'yearly' },
  ];
}
