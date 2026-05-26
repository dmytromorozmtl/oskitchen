import { createOgImageResponse } from '@/lib/seo/og-image-generator';
import { comparePageBySlug } from '@/lib/marketing/compare-content';

export const alt = 'KitchenOS comparison';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CompareSlugOgImage({ params }: Props) {
  const { slug } = await params;
  const content = comparePageBySlug(slug);

  return createOgImageResponse({
    eyebrow: content?.eyebrow ?? 'Compare',
    title: content?.headline ?? 'KitchenOS comparison',
    subtitle: content?.subheadline?.slice(0, 120) ?? 'Honest feature matrix for food operators.',
  });
}
