import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { MealPrepOrderQueueContent } from '@/lib/marketing/blog-content/meal-prep-order-queue';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'meal-prep-order-queue-cut-packing-errors';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: 'Cut Meal Prep Packing Errors with One Order Queue | OS Kitchen',
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: [
    'meal prep software',
    'meal prep order management',
    'weekly meal prep orders',
    'kitchen order queue',
  ],
});

export default function MealPrepOrderQueuePage() {
  return (
    <BlogArticleShell meta={meta}>
      <MealPrepOrderQueueContent />
    </BlogArticleShell>
  );
}
