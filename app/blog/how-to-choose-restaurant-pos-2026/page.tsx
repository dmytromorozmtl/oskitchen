import type { Metadata } from 'next';

import { BlogArticleShell } from '@/components/marketing/blog-article-shell';
import { ChooseRestaurantPos2026Content } from '@/lib/marketing/blog-content/choose-restaurant-pos-2026';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

const SLUG = 'how-to-choose-restaurant-pos-2026';
const meta = blogPostBySlug(SLUG)!;

export const metadata: Metadata = marketingPageMetadata({
  title: `${meta.title} | KitchenOS`,
  description: meta.description,
  path: `/blog/${SLUG}`,
  keywords: ['restaurant POS guide', 'choose POS software', 'restaurant technology 2026'],
});

export default function ChooseRestaurantPos2026Page() {
  return (
    <BlogArticleShell meta={meta}>
      <ChooseRestaurantPos2026Content />
    </BlogArticleShell>
  );
}
