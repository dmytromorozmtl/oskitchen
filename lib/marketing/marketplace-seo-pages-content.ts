import type { MarketplaceSeoSlug } from "@/lib/marketing/marketplace-seo-pages-policy";

export type MarketplaceSeoConfig = {
  slug: MarketplaceSeoSlug;
  path: string;
  metaTitle: string;
  metaDescription: string;
  keywords: readonly string[];
  eyebrow: string;
  h1: string;
  heroSubtitle: string;
  utmCampaign: string;
  features: readonly { title: string; description: string }[];
  faqs: readonly { question: string; answer: string }[];
};

export const MARKETPLACE_SEO_LIMITATIONS = [
  "HoReCa B2B marketplace is BETA — vendor catalogs require seeding in pilot workspaces.",
  "Side-by-side compare shows directional pricing — verify MOQ, lead time, and contract terms before PO.",
  "DoorDash and Uber Eats marketplace ops remain partner-gated — honest PASS / SKIPPED labels only.",
  "Invoice OCR and vendor onboarding depth vary by supplier — not certified procurement audit.",
] as const;

export const MARKETPLACE_SEO_CONFIG: Record<MarketplaceSeoSlug, MarketplaceSeoConfig> = {
  "restaurant-suppliers": {
    slug: "restaurant-suppliers",
    path: "/restaurant-suppliers",
    metaTitle: "Restaurant Suppliers — Compare HoReCa Vendors in One OS | OS Kitchen",
    metaDescription:
      "Find restaurant suppliers with side-by-side pricing, MOQ, and lead time — multi-vendor cart, net-terms checkout, and PO tracking in OS Kitchen. BETA marketplace.",
    keywords: [
      "restaurant suppliers",
      "horeca suppliers",
      "restaurant vendor marketplace",
      "food service suppliers",
      "restaurant procurement software",
    ],
    eyebrow: "Restaurant suppliers",
    h1: "Restaurant suppliers — compare, order, and track in one marketplace",
    heroSubtitle:
      "Side-by-side supplier comparison for dry goods, packaging, and equipment — multi-vendor checkout splits POs per vendor. BETA: verify vendor SLAs before switching primary suppliers.",
    utmCampaign: "restaurant_suppliers_seo",
    features: [
      {
        title: "Side-by-side compare",
        description:
          "Match SKUs by name or GTIN across approved vendors — sort by price, MOQ, lead time, or rating.",
      },
      {
        title: "Multi-vendor cart",
        description:
          "One checkout fans out separate POs per supplier — manager approval gates when configured.",
      },
      {
        title: "PO tracking",
        description:
          "Purchase orders, receiving, and disputes route through the marketplace hub — not email threads.",
      },
    ],
    faqs: [
      {
        question: "Is the restaurant supplier marketplace live for every region?",
        answer:
          "Catalog coverage depends on onboarded vendors in your workspace — BETA pilot seeding required. Verify Integration Health before external claims.",
      },
      {
        question: "Can I compare my current distributor to marketplace vendors?",
        answer:
          "Use compare by product name or GTIN for directional pricing — not certified bid quotes. Confirm contract terms with each supplier.",
      },
    ],
  },
  "food-distributors": {
    slug: "food-distributors",
    path: "/food-distributors",
    metaTitle: "Food Distributors — Multi-Vendor Purchasing for Operators | OS Kitchen",
    metaDescription:
      "Food distributors and broadline alternatives in one dashboard — compare unit costs, MOQ, and delivery windows. OS Kitchen marketplace with honest BETA labels.",
    keywords: [
      "food distributors",
      "restaurant food distributor",
      "broadline distributor software",
      "food distributor comparison",
      "horeca distributor marketplace",
    ],
    eyebrow: "Food distributors",
    h1: "Food distributors — unit cost, MOQ, and delivery in one view",
    heroSubtitle:
      "Compare food distributors without spreadsheet exports — typical directional savings, not certified RFP results. Verify lead times and cold-chain SLAs per vendor.",
    utmCampaign: "food_distributors_seo",
    features: [
      {
        title: "Price intelligence",
        description:
          "See unit cost, case size, and MOQ on every SKU — best-price badge on lowest offer when multiple vendors match.",
      },
      {
        title: "Recurring POs",
        description:
          "Save staple carts and schedule weekly or monthly runs — approval gates for manager-controlled spend.",
      },
      {
        title: "Vendor trust signals",
        description:
          "Verified vendor badges, SLA summaries, and reviews — dispute workflow when receiving exceptions occur.",
      },
    ],
    faqs: [
      {
        question: "Does OS Kitchen replace my broadline distributor contract?",
        answer:
          "Marketplace complements existing vendors — use compare for substitutions and new categories. Not a certified broadline replacement without pilot proof.",
      },
      {
        question: "How are cold-chain and delivery windows shown?",
        answer:
          "Lead time days and vendor SLAs surface on catalog cards — verify per-vendor delivery windows before relying on them for production planning.",
      },
    ],
  },
  "restaurant-marketplace": {
    slug: "restaurant-marketplace",
    path: "/restaurant-marketplace",
    metaTitle: "Restaurant Marketplace — B2B Purchasing Inside Kitchen OS | OS Kitchen",
    metaDescription:
      "Restaurant marketplace for operators — catalog, compare, cart, PO, and vendor payouts in one OS. Full stack beyond inventory-only tools. 14-day trial.",
    keywords: [
      "restaurant marketplace",
      "restaurant b2b marketplace",
      "horeca marketplace",
      "restaurant purchasing platform",
      "food operator marketplace",
    ],
    eyebrow: "Restaurant marketplace",
    h1: "Restaurant marketplace — procurement inside your kitchen OS",
    heroSubtitle:
      "Full OS — including marketplace. Compare suppliers, place multi-vendor POs, and track fulfillment without a separate AP silo. BETA: verify maturity labels on /trust.",
    utmCampaign: "restaurant_marketplace_seo",
    features: [
      {
        title: "Catalog + compare + cart",
        description:
          "Browse HoReCa categories, add to compare tray, and checkout with net terms or card when configured.",
      },
      {
        title: "Vendor onboarding",
        description:
          "Suppliers publish catalogs with MOQ, tiers, and delivery zones — commission model BETA for featured placement.",
      },
      {
        title: "Ops-connected POs",
        description:
          "Receiving ties into inventory counts — invoice matching when OCR is configured in your workspace.",
      },
    ],
    faqs: [
      {
        question: "How is this different from inventory-only software?",
        answer:
          "Marketplace sits beside POS, KDS, production, and storefront — scanned invoices feed ops, not a standalone AP product.",
      },
      {
        question: "What maturity should I expect in pilot?",
        answer:
          "Start with catalog, compare, and PO flows — payout webhooks and live aggregator ops carry BETA or SKIPPED labels until partner proof.",
      },
    ],
  },
};

export function getMarketplaceSeoConfig(slug: MarketplaceSeoSlug): MarketplaceSeoConfig {
  return MARKETPLACE_SEO_CONFIG[slug];
}

export function marketplaceSeoCtaHref(
  base: "/signup" | "/book-demo" | "/demo" | "/pricing",
  slug: MarketplaceSeoSlug,
): string {
  const config = getMarketplaceSeoConfig(slug);
  const params = new URLSearchParams({
    utm_source: "landing",
    utm_medium: "seo",
    utm_campaign: config.utmCampaign,
  });
  if (base === "/signup") {
    params.set("redirect", "/dashboard/marketplace");
  }
  return `${base}?${params.toString()}`;
}

export const MARKETPLACE_SEO_OPERATOR_LINKS = [
  { label: "Marketplace hub", href: "/dashboard/marketplace" },
  { label: "Compare suppliers", href: "/dashboard/marketplace/compare" },
  { label: "Book a demo", href: "/book-demo" },
] as const;
