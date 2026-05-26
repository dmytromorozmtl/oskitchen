import { createOgImageResponse } from '@/lib/seo/og-image-generator';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  const post = blogPostBySlug('how-to-start-meal-prep-business')!;
  return createOgImageResponse({
    eyebrow: 'KitchenOS Blog',
    title: 'Start a Meal Prep Business in 2026',
    subtitle: post.description.slice(0, 100),
  });
}
