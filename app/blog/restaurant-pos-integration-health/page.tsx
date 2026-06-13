import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { RestaurantPosIntegrationHealthContent } from '@/lib/marketing/blog-content/restaurant-pos-integration-health';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'restaurant-pos-integration-health';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: `${meta.title} | OS Kitchen`,
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['restaurant pos integration health', 'pos webhook monitoring', 'integration health center'],
});

export default function RestaurantPosIntegrationHealthPage() {
  return (
    <BlogArticleShell meta={meta}>
      <RestaurantPosIntegrationHealthContent />
    </BlogArticleShell>
  );
}
