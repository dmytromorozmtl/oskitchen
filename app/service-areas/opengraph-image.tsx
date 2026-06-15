import { createOgImageResponse } from '@/lib/seo/og-image-generator';

export const alt = 'OS Kitchen Service Areas';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function ServiceAreasOgImage() {
  return createOgImageResponse({
    eyebrow: 'Service areas',
    title: 'US & Canada restaurant & kitchen software',
    subtitle: 'Cloud POS and kitchen operations — 14-day trial, no on-site install.',
  });
}
