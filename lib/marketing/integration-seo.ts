import type { Metadata } from 'next';

import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { integrationPages } from '@/lib/public-copy';

export type IntegrationSlug = keyof typeof integrationPages;

const SLUG_LABELS: Record<IntegrationSlug, string> = {
  woocommerce: 'WooCommerce',
  shopify: 'Shopify',
  'uber-eats': 'Uber Eats',
  'uber-direct': 'Uber Direct',
  'manual-orders': 'Manual orders',
  'public-storefront': 'Public storefront',
};

export function integrationPageMetadata(slug: IntegrationSlug): Metadata {
  const page = integrationPages[slug];
  const label = SLUG_LABELS[slug];

  return marketingPageMetadata({
    title: `${label} Integration — OS Kitchen`,
    description: page.description.slice(0, 155),
    path: `/integrations/${slug}`,
    keywords: [`${label} kitchen software`, 'meal prep integrations', 'restaurant order import'],
  });
}

/** Placeholder integrations are documented in the capability matrix — not promoted on the hub grid. */
const PUBLIC_INTEGRATION_HUB_SLUGS = (Object.keys(integrationPages) as IntegrationSlug[]).filter(
  (slug) => slug !== "uber-direct",
);

export const INTEGRATION_HUB_LINKS = PUBLIC_INTEGRATION_HUB_SLUGS.map((slug) => ({
  href: `/integrations/${slug}` as const,
  title: SLUG_LABELS[slug],
  body: integrationPages[slug].status,
}));
