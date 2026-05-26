/** Google Ads landing pages — campaign-specific copy; geo overlays in ads-geo-overrides.ts */

export type AdsLandingSlug =
  | 'restaurant-pos'
  | 'meal-prep-software'
  | 'catering-software'
  | 'ghost-kitchen-software';

export type AdsLandingConfig = {
  slug: AdsLandingSlug;
  path: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  bullets: string[];
  trustLine: string;
  proofQuote: string;
  proofAttribution: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  conversionLabel: string;
  utmCampaign: string;
  metaTitle: string;
  metaDescription: string;
};

export type ResolvedAdsLanding = AdsLandingConfig & {
  path: string;
  geoLabel?: string;
  metroSlug?: string;
};

const TRIAL_UTM = 'utm_source=google&utm_medium=cpc';

function signupHref(campaign: string, metro?: string) {
  const params = new URLSearchParams({
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: metro ? `${campaign}-${metro}` : campaign,
  });
  return `/signup?${params.toString()}`;
}

function demoHref(campaign: string, metro?: string) {
  const params = new URLSearchParams({
    utm_source: 'google',
    utm_medium: 'cpc',
    utm_campaign: metro ? `${campaign}-${metro}` : campaign,
  });
  return `/demo?${params.toString()}`;
}

export const GOOGLE_ADS_LANDINGS: AdsLandingConfig[] = [
  {
    slug: 'restaurant-pos',
    path: '/lp/restaurant-pos',
    eyebrow: 'Restaurant POS + kitchen display',
    headline: 'The POS and kitchen display your floor team actually wants to use',
    subheadline:
      'Table service, expo tickets, and QR orders on one web-based stream — on iPad or Android you already own. No proprietary terminal lease.',
    bullets: [
      'Visual floor plan and table status for servers',
      'Kitchen display with bump, color coding, and sound',
      'QR table ordering routed to the same ticket queue',
      '14-day trial · No credit card · Cancel anytime',
    ],
    trustLine: 'Cloud software · US & Canada · English support',
    proofQuote:
      'Guests still scan QR, but the kitchen sees the same ticket whether the server keyed it or they ordered from the phone.',
    proofAttribution: 'GM, full-service restaurant (pilot cohort — illustrative)',
    primaryCta: { label: 'Start free trial', href: signupHref('restaurant-pos') },
    secondaryCta: { label: 'See product tour', href: demoHref('restaurant-pos') },
    conversionLabel: 'LP_RESTAURANT_SIGNUP',
    utmCampaign: 'restaurant-pos',
    metaTitle: 'Restaurant POS + KDS — 14-Day Trial | KitchenOS',
    metaDescription:
      'Web-based restaurant POS with kitchen display, tables, and QR ordering. No hardware bundle. Start your 14-day trial.',
  },
  {
    slug: 'meal-prep-software',
    path: '/lp/meal-prep-software',
    eyebrow: 'Meal prep operations',
    headline: 'Turn weekly preorders into a production board your team can execute',
    subheadline:
      'Cutoff menus, confirmed quantities, packing by pickup window — replace the Sunday spreadsheet without hiring an ops analyst.',
    bullets: [
      'Branded storefront with prepared dates and cutoffs',
      'Production quantities generated from confirmed orders',
      'Packing sheets grouped by pickup lane',
      '14-day trial · Plans from $29/mo after trial',
    ],
    trustLine: 'Built for weekly batch operators · Stripe checkout when configured',
    proofQuote:
      'We stopped arguing about what to cook. The board shows what sold before we turn on the ovens.',
    proofAttribution: 'Owner-operator, weekly meal prep (pilot cohort — illustrative)',
    primaryCta: { label: 'Start free trial', href: signupHref('meal-prep') },
    secondaryCta: { label: 'Meal prep solution', href: '/solutions/meal-prep?utm_source=google&utm_medium=cpc&utm_campaign=meal-prep' },
    conversionLabel: 'LP_MEALPREP_SIGNUP',
    utmCampaign: 'meal-prep',
    metaTitle: 'Meal Prep Software — Production from Preorders | KitchenOS',
    metaDescription:
      'Meal prep software for weekly menus, production, and packing. 14-day free trial. No terminal lease.',
  },
  {
    slug: 'catering-software',
    path: '/lp/catering-software',
    eyebrow: 'Catering & events',
    headline: 'Quotes, deposits, and kitchen prep — one workspace for catering teams',
    subheadline:
      'Move from scattered emails and PDF quotes to confirmed events, production lists, and optional Stripe deposits when your account is configured.',
    bullets: [
      'Event orders with production and packing views',
      'Optional deposit links via Stripe Checkout',
      'Shared kitchen queue with dine-in when you run both',
      '14-day trial · Paid pilot with white-glove onboarding',
    ],
    trustLine: 'Catering deposits in beta — disclose timelines in sales call',
    proofQuote:
      'We finally see deposit status next to prep quantities instead of digging through three inboxes.',
    proofAttribution: 'Catering director (pilot cohort — illustrative)',
    primaryCta: { label: 'Start free trial', href: signupHref('catering') },
    secondaryCta: { label: 'Catering solution', href: '/solutions/catering?utm_source=google&utm_medium=cpc&utm_campaign=catering' },
    conversionLabel: 'LP_CATERING_SIGNUP',
    utmCampaign: 'catering',
    metaTitle: 'Catering Software — Quotes to Production | KitchenOS',
    metaDescription:
      'Catering software for events, production, and deposits. 14-day trial for North American operators.',
  },
  {
    slug: 'ghost-kitchen-software',
    path: '/lp/ghost-kitchen-software',
    eyebrow: 'Ghost & virtual brands',
    headline: 'Run multiple brands from one kitchen without duplicate systems',
    subheadline:
      'Separate menus and ticket streams per brand while production and dispatch stay in one operational view — built for virtual kitchens and delivery-first operators.',
    bullets: [
      'Brand-level menus and order routing',
      'Shared kitchen display with clear ticket source',
      'Production and pickup windows for high-volume days',
      '14-day trial · Web POS — no regional hardware depot',
    ],
    trustLine: 'Multi-brand UI available · unified dashboard on roadmap',
    proofQuote:
      'We stopped re-keying the same burger three times because each brand had its own tablet app.',
    proofAttribution: 'Virtual kitchen operator (pilot cohort — illustrative)',
    primaryCta: { label: 'Start free trial', href: signupHref('ghost-kitchen') },
    secondaryCta: { label: 'Ghost kitchen solution', href: '/solutions/ghost-kitchens?utm_source=google&utm_medium=cpc&utm_campaign=ghost-kitchen' },
    conversionLabel: 'LP_GHOST_SIGNUP',
    utmCampaign: 'ghost-kitchen',
    metaTitle: 'Ghost Kitchen Software — Multi-Brand Ops | KitchenOS',
    metaDescription:
      'Ghost kitchen software for multi-brand menus, KDS, and production. Cloud delivery in US & Canada.',
  },
];

export const ADS_LANDING_SLUGS = GOOGLE_ADS_LANDINGS.map((l) => l.slug);

export function adsLandingBySlug(slug: string): AdsLandingConfig | undefined {
  return GOOGLE_ADS_LANDINGS.find((l) => l.slug === slug);
}

/** Merge base config with optional geo overlay and rewrite CTA URLs for metro campaigns. */
export function resolveAdsLanding(
  slug: string,
  geo?: { metroSlug: string; metroLabel: string; headline: string; subheadline: string },
): ResolvedAdsLanding | undefined {
  const base = adsLandingBySlug(slug);
  if (!base) return undefined;

  if (!geo) {
    return { ...base, path: base.path };
  }

  const path = `${base.path}/${geo.metroSlug}`;
  const campaign = base.utmCampaign;

  return {
    ...base,
    path,
    geoLabel: geo.metroLabel,
    metroSlug: geo.metroSlug,
    headline: geo.headline,
    subheadline: geo.subheadline,
    primaryCta: {
      label: base.primaryCta.label,
      href: signupHref(campaign, geo.metroSlug),
    },
    secondaryCta: {
      label: base.secondaryCta.label,
      href:
        base.secondaryCta.href.startsWith('/demo')
          ? demoHref(campaign, geo.metroSlug)
          : `${base.secondaryCta.href.split('?')[0]}?utm_source=google&utm_medium=cpc&utm_campaign=${campaign}-${geo.metroSlug}`,
    },
    metaTitle: `${base.metaTitle.split('|')[0].trim()} — ${geo.metroLabel}`,
    metaDescription: `${base.metaDescription} Serving operators in ${geo.metroLabel}.`,
  };
}
