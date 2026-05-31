import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { PosComparison2026Content } from '@/lib/marketing/blog-content/pos-comparison-2026';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'restaurant-pos-comparison-2026';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: 'Restaurant POS Comparison 2026: Toast vs Square vs OS Kitchen',
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['restaurant POS comparison', 'Toast vs Square', 'best restaurant POS 2026'],
});

export default function RestaurantPosComparisonPage() {
  return (
    <BlogArticleShell meta={meta}>
      <PosComparison2026Content />
    </BlogArticleShell>
  );
}
