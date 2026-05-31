import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { GhostKitchenSetupGuideContent } from '@/lib/marketing/blog-content/ghost-kitchen-setup-guide';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'ghost-kitchen-setup-complete-guide';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: `${meta.title} | OS Kitchen`,
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['ghost kitchen setup', 'virtual brand kitchen', 'delivery kitchen software'],
});

export default function GhostKitchenSetupGuidePage() {
  return (
    <BlogArticleShell meta={meta}>
      <GhostKitchenSetupGuideContent />
    </BlogArticleShell>
  );
}
