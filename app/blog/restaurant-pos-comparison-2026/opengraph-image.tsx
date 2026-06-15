import { createOgImageResponse } from '@/lib/seo/og-image-generator';
import { blogPostBySlug } from '@/lib/marketing/blog-posts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  const post = blogPostBySlug('restaurant-pos-comparison-2026')!;
  return createOgImageResponse({
    eyebrow: 'OS Kitchen Blog',
    title: 'Restaurant POS Comparison 2026',
    subtitle: 'Toast vs Square vs OS Kitchen',
  });
}
