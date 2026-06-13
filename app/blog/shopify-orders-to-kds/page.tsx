import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { ShopifyOrdersToKdsContent } from '@/lib/marketing/blog-content/shopify-orders-to-kds';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'shopify-orders-to-kds';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: `${meta.title} | OS Kitchen`,
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['shopify orders to kds', 'shopify kitchen display', 'ecommerce kitchen integration'],
});

export default function ShopifyOrdersToKdsPage() {
  return (
    <BlogArticleShell meta={meta}>
      <ShopifyOrdersToKdsContent />
    </BlogArticleShell>
  );
}
