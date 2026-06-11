import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { CommissaryKitchenSoftwareGuideContent } from '@/lib/marketing/blog-content/commissary-kitchen-software-guide';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'commissary-kitchen-software-guide';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: 'Commissary Kitchen Software Guide 2026 | OS Kitchen',
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: [
    'commissary kitchen software',
    'shared kitchen software',
    'multi-tenant kitchen ops',
    'commissary production management',
  ],
});

export default function CommissaryKitchenSoftwareGuidePage() {
  return (
    <BlogArticleShell meta={meta}>
      <CommissaryKitchenSoftwareGuideContent />
    </BlogArticleShell>
  );
}
