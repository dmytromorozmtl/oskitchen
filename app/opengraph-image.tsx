import { createOgImageResponse } from '@/lib/seo/og-image-generator';

export const alt = 'KitchenOS — Restaurant POS & Kitchen Operations Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return createOgImageResponse({
    eyebrow: 'KitchenOS',
    title: 'Restaurant POS + Kitchen Operations',
    subtitle: 'One platform for orders, kitchen display, and fulfillment — 14-day free trial.',
  });
}
