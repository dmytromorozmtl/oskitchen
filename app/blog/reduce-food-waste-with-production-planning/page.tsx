import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { FoodWasteProductionContent } from '@/lib/marketing/blog-content/food-waste-production';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'reduce-food-waste-with-production-planning';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: 'How to Reduce Food Waste with Production Planning | OS Kitchen',
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['reduce food waste restaurant', 'production planning kitchen', 'kitchen waste software'],
});

export default function FoodWasteProductionPage() {
  return (
    <BlogArticleShell meta={meta}>
      <FoodWasteProductionContent />
    </BlogArticleShell>
  );
}
