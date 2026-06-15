import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AdsLandingPage } from '@/components/marketing/ads-landing-page';
import { adsGeoOverride, ADS_GEO_OVERRIDES } from '@/lib/marketing/ads-geo-overrides';
import type { AdsLandingSlug } from '@/lib/marketing/google-ads-landings';
import { ADS_LANDING_SLUGS, resolveAdsLanding } from '@/lib/marketing/google-ads-landings';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

type PageProps = {
  params: Promise<{ slug: string; metro: string }>;
};

export function generateStaticParams() {
  const params: Array<{ slug: string; metro: string }> = [];
  for (const slug of ADS_LANDING_SLUGS) {
    for (const geo of ADS_GEO_OVERRIDES) {
      if (geo.campaigns.includes(slug as AdsLandingSlug)) {
        params.push({ slug, metro: geo.metroSlug });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, metro } = await params;
  const geo = adsGeoOverride(slug, metro);
  const config = geo ? resolveAdsLanding(slug, geo) : undefined;
  if (!config) return { title: 'OS Kitchen' };

  return marketingPageMetadata({
    title: config.metaTitle,
    description: config.metaDescription,
    path: config.path,
    noIndex: true,
  });
}

export default async function AdsLandingGeoPage({ params }: PageProps) {
  const { slug, metro } = await params;
  const geo = adsGeoOverride(slug, metro);
  if (!geo) notFound();

  const config = resolveAdsLanding(slug, geo);
  if (!config) notFound();

  return <AdsLandingPage config={config} />;
}
