import type { AdsLandingSlug } from '@/lib/marketing/google-ads-landings';

export type AdsMetroSlug = 'nyc' | 'la' | 'chicago' | 'toronto' | 'austin' | 'miami';

export type AdsGeoOverride = {
  metroSlug: AdsMetroSlug;
  metroLabel: string;
  /** Which base campaign slugs this metro applies to */
  campaigns: AdsLandingSlug[];
  headline: string;
  subheadline: string;
};

export const ADS_GEO_OVERRIDES: AdsGeoOverride[] = [
  {
    metroSlug: 'nyc',
    metroLabel: 'New York City',
    campaigns: ['restaurant-pos', 'ghost-kitchen-software'],
    headline: 'Restaurant POS and KDS for New York City operators',
    subheadline:
      'Full-service dining and virtual brands in NYC run table POS, expo, and QR on the devices you already use — no Midtown hardware showroom required.',
  },
  {
    metroSlug: 'la',
    metroLabel: 'Los Angeles',
    campaigns: ['restaurant-pos', 'meal-prep-software'],
    headline: 'Meal prep and restaurant ops software for Los Angeles kitchens',
    subheadline:
      'Weekly batch brands and fast-casual teams in LA connect preorders to production and keep the line in sync during high-volume pickup windows.',
  },
  {
    metroSlug: 'chicago',
    metroLabel: 'Chicago',
    campaigns: ['restaurant-pos', 'catering-software'],
    headline: 'Restaurant and catering software built for Chicago operators',
    subheadline:
      'Neighborhood restaurants and event caterers in Chicago move quotes, kitchen prep, and floor service into one cloud workspace.',
  },
  {
    metroSlug: 'toronto',
    metroLabel: 'Toronto',
    campaigns: ['meal-prep-software', 'ghost-kitchen-software'],
    headline: 'Meal prep and multi-brand kitchen software for Toronto',
    subheadline:
      'GTA operators run weekly menus, virtual brands, and shared production from one system — bilingual menus supported in product.',
  },
  {
    metroSlug: 'austin',
    metroLabel: 'Austin',
    campaigns: ['restaurant-pos', 'ghost-kitchen-software'],
    headline: 'Fast-casual and ghost kitchen POS for Austin operators',
    subheadline:
      'Food halls and delivery-first brands in Austin unify counter POS, KDS, and brand-level menus without a terminal lease.',
  },
  {
    metroSlug: 'miami',
    metroLabel: 'Miami',
    campaigns: ['restaurant-pos', 'catering-software'],
    headline: 'Restaurant and catering operations software for Miami',
    subheadline:
      'Dine-in, events, and high-season volume in Miami — one ticket stream from quote to expo bump.',
  },
];

export const ADS_METRO_SLUGS = [...new Set(ADS_GEO_OVERRIDES.map((g) => g.metroSlug))] as AdsMetroSlug[];

export function adsGeoOverride(
  campaignSlug: string,
  metroSlug: string,
): AdsGeoOverride | undefined {
  return ADS_GEO_OVERRIDES.find(
    (g) => g.metroSlug === metroSlug && g.campaigns.includes(campaignSlug as AdsLandingSlug),
  );
}

export function geoPathsForCampaign(campaignSlug: AdsLandingSlug): string[] {
  return ADS_GEO_OVERRIDES.filter((g) => g.campaigns.includes(campaignSlug)).map(
    (g) => `/lp/${campaignSlug}/${g.metroSlug}`,
  );
}
