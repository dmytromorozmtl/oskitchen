/** Local / regional SEO content — cloud software; no physical storefront claims. */

export const SERVICE_AREAS_COPY = {
  metaTitle: 'Service Areas | OS Kitchen — United States & Canada',
  metaDescription:
    'Cloud restaurant POS and kitchen operations for US and Canadian operators. English support, 14-day trial, no on-site install required.',
  headline: 'Built for food operators across North America',
  subheadline:
    'OS Kitchen delivers POS, kitchen display, and production workflows to restaurants, meal prep brands, caterers, and ghost kitchens — wherever you run a licensed kitchen with a reliable connection.',
  disclaimer:
    'OS Kitchen is cloud software delivered remotely. We do not operate restaurant locations. Support is provided in English with coverage aligned to US and Canadian business hours.',
} as const;

export type ServiceRegion = {
  id: string;
  name: string;
  description: string;
  highlights: string[];
};

export const SERVICE_REGIONS: ServiceRegion[] = [
  {
    id: 'united-states',
    name: 'United States',
    description:
      'Full-service restaurants, bars, cafés, meal prep, catering, bakeries, and ghost kitchens in all 50 states. Billing and checkout run through Stripe where enabled in your account.',
    highlights: [
      'English-language onboarding and support',
      'USD pricing on published plans',
      'Web POS and KDS — no terminal lease',
    ],
  },
  {
    id: 'canada',
    name: 'Canada',
    description:
      'Operators from coast to coast use OS Kitchen for dine-in, meal prep batches, catering events, and multi-brand virtual kitchens — with the same cloud stack as US accounts.',
    highlights: [
      'CAD-friendly operator workflows',
      'Bilingual menu content in product',
      'Cloud kitchen display and production',
    ],
  },
];

export const TOP_METRO_MARKETS = [
  { city: 'New York', state: 'NY', focus: 'Full-service dining & ghost kitchens' },
  { city: 'Los Angeles', state: 'CA', focus: 'Meal prep brands & fast-casual' },
  { city: 'Chicago', state: 'IL', focus: 'Catering & multi-location restaurants' },
  { city: 'Toronto', state: 'ON', focus: 'Meal prep & multi-brand operators' },
  { city: 'Austin', state: 'TX', focus: 'Fast-casual, bars & food halls' },
  { city: 'Miami', state: 'FL', focus: 'Restaurants & event catering' },
  { city: 'San Francisco', state: 'CA', focus: 'Fast-casual & virtual brands' },
  { city: 'Vancouver', state: 'BC', focus: 'Cafés, meal prep & catering' },
] as const;
