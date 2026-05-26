import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AdsLandingPage } from '@/components/marketing/ads-landing-page';
import { ADS_LANDING_SLUGS, resolveAdsLanding } from '@/lib/marketing/google-ads-landings';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return ADS_LANDING_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = resolveAdsLanding(slug);
  if (!resolved) return { title: 'KitchenOS' };

  return marketingPageMetadata({
    title: resolved.metaTitle,
    description: resolved.metaDescription,
    path: resolved.path,
    noIndex: true,
  });
}

export default async function AdsLandingSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const config = resolveAdsLanding(slug);
  if (!config) notFound();
  return <AdsLandingPage config={config} />;
}
