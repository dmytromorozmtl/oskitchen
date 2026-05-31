import { createOgImageResponse } from '@/lib/seo/og-image-generator';

export const alt = 'Compare OS Kitchen';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function CompareHubOgImage() {
  return createOgImageResponse({
    eyebrow: 'Compare',
    title: 'Honest POS & kitchen software comparisons',
    subtitle: 'Feature matrices, TCO framing, and decision guides for operators.',
  });
}
