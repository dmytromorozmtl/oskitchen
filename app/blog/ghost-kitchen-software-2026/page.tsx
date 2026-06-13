import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { GhostKitchenSoftware2026Content } from '@/lib/marketing/blog-content/ghost-kitchen-software-2026';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'ghost-kitchen-software-2026';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: `${meta.title} | OS Kitchen`,
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['ghost kitchen software 2026', 'virtual brand kitchen software', 'delivery kitchen platform'],
});

export default function GhostKitchenSoftware2026Page() {
  return (
    <BlogArticleShell meta={meta}>
      <GhostKitchenSoftware2026Content />
    </BlogArticleShell>
  );
}
