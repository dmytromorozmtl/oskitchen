import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { MultiChannelDeliveryOrderHubContent } from '@/lib/marketing/blog-content/multi-channel-delivery-order-hub';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'multi-channel-delivery-order-hub';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: `${meta.title} | OS Kitchen`,
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['multi channel delivery order hub', 'delivery order aggregator hub', 'unified kitchen queue'],
});

export default function MultiChannelDeliveryOrderHubPage() {
  return (
    <BlogArticleShell meta={meta}>
      <MultiChannelDeliveryOrderHubContent />
    </BlogArticleShell>
  );
}
