import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { MealPrepSubscriptionManagementContent } from '@/lib/marketing/blog-content/meal-prep-subscription-management';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'meal-prep-subscription-management';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: `${meta.title} | OS Kitchen`,
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['meal prep subscription management', 'meal prep billing software', 'subscription kitchen software'],
});

export default function MealPrepSubscriptionManagementPage() {
  return (
    <BlogArticleShell meta={meta}>
      <MealPrepSubscriptionManagementContent />
    </BlogArticleShell>
  );
}
