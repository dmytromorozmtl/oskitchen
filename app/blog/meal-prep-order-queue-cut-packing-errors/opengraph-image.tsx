import { createOgImageResponse } from '@/lib/seo/og-image-generator';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return createOgImageResponse({
    eyebrow: 'OS Kitchen Blog · Meal Prep',
    title: 'One Order Queue for Weekly Meal Prep',
    subtitle: 'Cut packing errors and missed cutoffs without spreadsheet chaos.',
  });
}
