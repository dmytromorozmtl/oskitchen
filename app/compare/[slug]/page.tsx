import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CompareLanding } from '@/components/marketing/compare-landing';
import { COMPARE_SLUGS, comparePageBySlug } from '@/lib/marketing/compare-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return COMPARE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = comparePageBySlug(slug);
  if (!content) return { title: 'Compare | KitchenOS' };

  return marketingPageMetadata({
    title: content.metaTitle,
    description: content.metaDescription,
    path: content.path,
    keywords: [
      content.slug === 'restaurant-pos' ? 'Toast vs Square vs KitchenOS' : 'meal prep software comparison',
    ],
  });
}

export default async function CompareSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const content = comparePageBySlug(slug);
  if (!content) notFound();
  return <CompareLanding content={content} />;
}
