import { createOgImageResponse } from '@/lib/seo/og-image-generator';

export const alt = 'OS Kitchen Solutions';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function SolutionsOgImage() {
  return createOgImageResponse({
    eyebrow: 'Solutions',
    title: 'POS & kitchen ops for every food business',
    subtitle: 'Restaurants, meal prep, catering, bakeries, bars, and ghost kitchens.',
  });
}
