import { createOgImageResponse } from '@/lib/seo/og-image-generator';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return createOgImageResponse({
    eyebrow: 'OS Kitchen Blog',
    title: 'Reduce Food Waste with Production Planning',
    subtitle: 'Cut kitchen waste 4–10% of food cost with a weekly planning loop.',
  });
}
