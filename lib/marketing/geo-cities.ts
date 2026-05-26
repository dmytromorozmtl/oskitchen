export type GeoCity = {
  slug: string;
  name: string;
  region: string;
  headline: string;
  subheadline: string;
  marketStat: string;
  localContext: string;
  keywords: string[];
};

export const GEO_CITIES: GeoCity[] = [
  {
    slug: "los-angeles",
    name: "Los Angeles",
    region: "California",
    headline: "Ghost kitchen software for Los Angeles operators",
    subheadline:
      "Run multi-brand delivery, commissary production, and storefront preorders from one workspace built for LA's high-volume delivery market.",
    marketStat: "2,400+ licensed commercial kitchens in Greater LA (estimate)",
    localContext:
      "From Downtown commissaries to Valley meal prep brands — unify DoorDash, Uber Eats, and owned preorder without spreadsheet chaos.",
    keywords: ["ghost kitchen software Los Angeles", "meal prep software LA"],
  },
  {
    slug: "new-york",
    name: "New York",
    region: "New York",
    headline: "Meal prep delivery software for New York operators",
    subheadline:
      "Weekly menus, route planning, and KDS throughput for NYC's five-borough delivery density.",
    marketStat: "Highest per-capita meal delivery spend in the US",
    localContext:
      "Brooklyn commissaries and Manhattan ghost brands use KitchenOS to cut packing errors and scale borough routes.",
    keywords: ["meal prep delivery software New York", "ghost kitchen NYC software"],
  },
  {
    slug: "chicago",
    name: "Chicago",
    region: "Illinois",
    headline: "Kitchen operations platform for Chicago food businesses",
    subheadline:
      "Production boards, catering quotes, and multi-location inventory for Midwest operators.",
    marketStat: "Growing ghost kitchen hub in Fulton Market and suburbs",
    localContext:
      "Seasonal catering peaks and harsh winters demand reliable preorder and production planning — not Friday spreadsheet fire drills.",
    keywords: ["restaurant kitchen software Chicago", "meal prep software Chicago"],
  },
  {
    slug: "toronto",
    name: "Toronto",
    region: "Ontario",
    headline: "Food operations software for Toronto operators",
    subheadline:
      "CAD billing, bilingual storefronts, and delivery-aggregator sync for the GTA.",
    marketStat: "Canada's largest meal delivery and ghost kitchen market",
    localContext:
      "From Liberty Village cloud kitchens to suburban meal prep — one system for production, POS, and online ordering.",
    keywords: ["ghost kitchen software Toronto", "meal prep software Canada"],
  },
  {
    slug: "miami",
    name: "Miami",
    region: "Florida",
    headline: "KitchenOS for Miami delivery-first brands",
    subheadline:
      "High-volume weekend spikes, catering, and multi-brand ghost kitchens on one production view.",
    marketStat: "Year-round tourism drives delivery volatility",
    localContext:
      "South Florida operators use KitchenOS to align production with preorder windows and reduce ticket times on KDS.",
    keywords: ["ghost kitchen software Miami", "restaurant POS Miami"],
  },
  {
    slug: "austin",
    name: "Austin",
    region: "Texas",
    headline: "Meal prep & ghost kitchen software for Austin",
    subheadline:
      "Scale from farmers market pop-ups to multi-rack commissary production without hiring an ops team.",
    marketStat: "Fast-growing food entrepreneur hub",
    localContext:
      "Austin's tech-savvy operators want self-serve setup, Stripe checkout, and honest compare pages — not six-month implementations.",
    keywords: ["meal prep software Austin", "ghost kitchen Austin"],
  },
];

export function geoCityBySlug(slug: string): GeoCity | undefined {
  return GEO_CITIES.find((c) => c.slug === slug);
}
