import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { MealPrepGuideContent } from '@/lib/marketing/blog-content/meal-prep-guide';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'how-to-start-meal-prep-business';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: 'How to Start a Meal Prep Business in 2026 — Complete Guide | OS Kitchen',
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['start meal prep business', 'meal prep business plan', 'meal prep software'],
});

export default function MealPrepBusinessGuidePage() {
  return (
    <BlogArticleShell meta={meta}>
      <MealPrepGuideContent />
    </BlogArticleShell>
  );
}
