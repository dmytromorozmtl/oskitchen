import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { WhyWeBuiltOsKitchenContent } from '@/lib/marketing/blog-content/why-we-built-os-kitchen';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'why-we-built-os-kitchen';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: `${meta.title} | OS Kitchen`,
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: [
    'founder story restaurant software',
    'why we built os kitchen',
    'kitchen operating system founder',
    'design partner program restaurant',
  ],
});

export default function WhyWeBuiltOsKitchenPage() {
  return (
    <BlogArticleShell meta={meta}>
      <WhyWeBuiltOsKitchenContent />
    </BlogArticleShell>
  );
}
