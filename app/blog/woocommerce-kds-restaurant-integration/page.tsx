import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { WooCommerceKdsRestaurantIntegrationContent } from '@/lib/marketing/blog-content/woocommerce-kds-restaurant-integration';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'woocommerce-kds-restaurant-integration';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: `${meta.title} | OS Kitchen`,
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['woocommerce kds restaurant integration', 'wordpress kitchen display', 'woocommerce kitchen orders'],
});

export default function WooCommerceKdsRestaurantIntegrationPage() {
  return (
    <BlogArticleShell meta={meta}>
      <WooCommerceKdsRestaurantIntegrationContent />
    </BlogArticleShell>
  );
}
