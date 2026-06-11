import { comparePageBySlug } from "@/lib/marketing/compare-content";
import type { CompetitorAlternativeSlug } from "@/lib/marketing/competitor-alternative-pages-policy";
import { COMPETITOR_ALTERNATIVE_PAGES } from "@/lib/marketing/competitor-alternative-pages-policy";
import { MARGINEDGE_POSITIONING_PRIMARY_LINE } from "@/lib/marketing/marginedge-positioning-policy";
import { MARKETMAN_POSITIONING_PRIMARY_LINE } from "@/lib/marketing/marketman-positioning-policy";
import { SQUARE_POSITIONING_PRIMARY_LINE } from "@/lib/marketing/square-positioning-policy";
import { TOAST_POSITIONING_PRIMARY_LINE } from "@/lib/marketing/toast-positioning-policy";

export type CompetitorAlternativeConfig = {
  slug: CompetitorAlternativeSlug;
  path: string;
  compareSlug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: readonly string[];
  h1: string;
  heroSubtitle: string;
  competitorWins: string;
  utmCampaign: string;
  positioningLine?: string;
};

const SHARED_LIMITATIONS = [
  "WooCommerce and Shopify channel imports are BETA — configure credentials and review Integration Health before claiming live sync.",
  "Marketplace aggregator live ops remain partner-gated — honest PASS / SKIPPED / FAILED labels only.",
  "HoReCa B2B marketplace is BETA scaffold — vendor seeding required in pilot.",
  "AI modules ship at qualified maturity — verify /trust before external claims.",
] as const;

export const COMPETITOR_ALTERNATIVE_LIMITATIONS = SHARED_LIMITATIONS;

export const COMPETITOR_ALTERNATIVE_CONFIG: Record<
  CompetitorAlternativeSlug,
  CompetitorAlternativeConfig
> = {
  toast: {
    slug: "toast",
    path: "/toast-alternative",
    compareSlug: "toast",
    metaTitle: "Toast Alternative — Kitchen Ops Without Hardware Lock-In | OS Kitchen",
    metaDescription:
      "Looking for a Toast alternative? OS Kitchen runs POS, KDS, production, and storefront on devices you own — no proprietary terminal lease. 14-day free trial.",
    keywords: [
      "toast alternative",
      "toast pos alternative",
      "restaurant software without toast hardware",
      "toast competitor",
    ],
    h1: "Toast Alternative — Run Kitchen Ops Without Hardware Lock-In",
    heroSubtitle: `${TOAST_POSITIONING_PRIMARY_LINE} Operators evaluating a Toast alternative usually need production truth and multi-channel ops — not another terminal lease.`,
    competitorWins:
      "Toast wins on certified hardware, field support, and payments-first rollout — verify Toast bundles before switching.",
    utmCampaign: "toast_alternative_seo",
    positioningLine: TOAST_POSITIONING_PRIMARY_LINE,
  },
  square: {
    slug: "square",
    path: "/square-alternative",
    compareSlug: "square",
    metaTitle: "Square Alternative — Enterprise Ops Without Enterprise Contracts | OS Kitchen",
    metaDescription:
      "Square alternative for food operators who outgrew counter POS — marketplace, KDS, production board, and invoice AI in one OS. Published pricing, 14-day trial.",
    keywords: [
      "square alternative",
      "square restaurant alternative",
      "square pos competitor",
      "restaurant ops software",
    ],
    h1: "Square Alternative — Enterprise Features Without Enterprise Contracts",
    heroSubtitle: `${SQUARE_POSITIONING_PRIMARY_LINE} A Square alternative makes sense when orders drive production, packing, and multi-brand ops — not just card swipe.`,
    competitorWins:
      "Square wins on frictionless SMB signup and Cash App ecosystem — say that aloud for counter-first cafés.",
    utmCampaign: "square_alternative_seo",
    positioningLine: SQUARE_POSITIONING_PRIMARY_LINE,
  },
  marketman: {
    slug: "marketman",
    path: "/marketman-alternative",
    compareSlug: "marketman",
    metaTitle: "MarketMan Alternative — Full OS Including Marketplace | OS Kitchen",
    metaDescription:
      "MarketMan alternative with POS, KDS, production, and B2B marketplace purchasing — not inventory-only back office. 14-day free trial.",
    keywords: [
      "marketman alternative",
      "restaurant inventory software alternative",
      "marketman competitor",
      "food cost software alternative",
    ],
    h1: "MarketMan Alternative — Full OS, Including Marketplace",
    heroSubtitle: `${MARKETMAN_POSITIONING_PRIMARY_LINE} A MarketMan alternative fits when scanned invoices must feed live kitchen ops — not a standalone AP silo.`,
    competitorWins:
      "MarketMan wins on mature invoice OCR and vendor item masters — verify OCR tiers before dual-vendor stacks.",
    utmCampaign: "marketman_alternative_seo",
    positioningLine: MARKETMAN_POSITIONING_PRIMARY_LINE,
  },
  marginedge: {
    slug: "marginedge",
    path: "/marginedge-alternative",
    compareSlug: "marginedge",
    metaTitle: "MarginEdge Alternative — Invoice AI Inside a Full Kitchen OS | OS Kitchen",
    metaDescription:
      "MarginEdge alternative: invoice capture inside POS, KDS, and production — not invoice AI as a standalone product. BETA invoice scanner, 14-day trial.",
    keywords: [
      "marginedge alternative",
      "invoice ocr restaurant alternative",
      "marginedge competitor",
      "restaurant ap software alternative",
    ],
    h1: "MarginEdge Alternative — Invoice AI Is a Feature, Not a Product",
    heroSubtitle: `${MARGINEDGE_POSITIONING_PRIMARY_LINE} A MarginEdge alternative fits when finance wants invoice capture tied to today's tickets and production board.`,
    competitorWins:
      "MarginEdge wins on dedicated invoice OCR depth and price-variance alerts — verify accuracy tiers before purchase.",
    utmCampaign: "marginedge_alternative_seo",
    positioningLine: MARGINEDGE_POSITIONING_PRIMARY_LINE,
  },
  restaurant365: {
    slug: "restaurant365",
    path: "/restaurant365-alternative",
    compareSlug: "restaurant365",
    metaTitle: "Restaurant365 Alternative — Kitchen Ops Without Six-Figure Impl | OS Kitchen",
    metaDescription:
      "Restaurant365 alternative for 1–3 location operators: POS, KDS, production, and storefront in days — not months of enterprise accounting rollout.",
    keywords: [
      "restaurant365 alternative",
      "r365 alternative",
      "restaurant365 competitor",
      "restaurant accounting software alternative",
    ],
    h1: "Restaurant365 Alternative — Kitchen Ops First, Not GL First",
    heroSubtitle:
      "R365 wins enterprise accounting at scale. An R365 alternative fits when you need POS, KDS, and production live this month — with honest AP growth path.",
    competitorWins:
      "Restaurant365 wins on deep GL, enterprise AP, and SOC2 vendor maturity at 20+ locations — verify R365 services bundle before switching.",
    utmCampaign: "restaurant365_alternative_seo",
  },
};

export function getCompetitorAlternativeConfig(
  slug: CompetitorAlternativeSlug,
): CompetitorAlternativeConfig {
  return COMPETITOR_ALTERNATIVE_CONFIG[slug];
}

export function getCompetitorAlternativeByPath(
  path: string,
): CompetitorAlternativeConfig | undefined {
  return COMPETITOR_ALTERNATIVE_PAGES.find((entry) => entry.path === path)
    ? COMPETITOR_ALTERNATIVE_CONFIG[
        COMPETITOR_ALTERNATIVE_PAGES.find((entry) => entry.path === path)!.slug
      ]
    : undefined;
}

export function competitorAlternativeCtaHref(
  base: "/signup" | "/book-demo" | "/demo",
  slug: CompetitorAlternativeSlug,
): string {
  const config = getCompetitorAlternativeConfig(slug);
  const params = new URLSearchParams({
    utm_source: "alternative",
    utm_medium: "seo",
    utm_campaign: config.utmCampaign,
  });
  if (base === "/signup") {
    params.set("redirect", "/demo/meal-prep");
  }
  return `${base}?${params.toString()}`;
}

export function getCompetitorAlternativeCompareContent(slug: CompetitorAlternativeSlug) {
  const config = getCompetitorAlternativeConfig(slug);
  const compare = comparePageBySlug(config.compareSlug);
  if (!compare) {
    throw new Error(`Missing compare content for ${slug}`);
  }
  return compare;
}
