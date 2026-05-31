import { createOgImageResponse } from '@/lib/seo/og-image-generator';
import { GET_STARTED_COPY } from '@/lib/marketing/get-started-content';

export const alt = 'Get started with OS Kitchen';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function GetStartedOgImage() {
  return createOgImageResponse({
    eyebrow: GET_STARTED_COPY.eyebrow,
    title: 'Choose your path to a calmer kitchen',
    subtitle: GET_STARTED_COPY.trustLine,
  });
}
