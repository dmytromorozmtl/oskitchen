import {
  aggregateCapitalRevenueForWindow,
  CAPITAL_REVENUE_DEFINITION_NOTE,
  defaultTrailingYearWindow,
} from "@/lib/commercial/capital-revenue-aggregation";
import {
  getCapitalPartnerBySlug,
  listFeaturedCapitalPartners,
  listLenderOfferPartners,
  loadCapitalPartnersConfig,
  type CapitalPartner,
} from "@/lib/commercial/capital-partners";
import {
  listCapitalLenderOffersForOwner,
  type CapitalLenderOfferRow,
} from "@/services/commercial/capital-lender-offers-service";
import { listRevenueAttestationsForOwner } from "@/services/commercial/revenue-attestation-service";

export type CapitalRevenueContext = {
  periodStart: string;
  periodEnd: string;
  grossOrderRevenue: number;
  orderCount: number;
  cancelledOrderCount: number;
  currency: string;
  locationCount: number;
  tenureDays: number | null;
  definitionNote: string;
  hasOrderData: boolean;
};

export type CapitalResourcesHubData = {
  config: ReturnType<typeof loadCapitalPartnersConfig>;
  featuredPartners: CapitalPartner[];
  revenueContext: CapitalRevenueContext;
  recentAttestations: Awaited<ReturnType<typeof listRevenueAttestationsForOwner>>;
  lenderOfferPartners: CapitalPartner[];
  lenderReferrals: CapitalLenderOfferRow[];
};

export async function loadCapitalRevenueContext(userId: string): Promise<CapitalRevenueContext> {
  const { from, to } = defaultTrailingYearWindow();
  const aggregate = await aggregateCapitalRevenueForWindow({ userId, from, to });
  return {
    periodStart: aggregate.periodStart,
    periodEnd: aggregate.periodEnd,
    grossOrderRevenue: aggregate.grossOrderRevenue,
    orderCount: aggregate.orderCount,
    cancelledOrderCount: aggregate.cancelledOrderCount,
    currency: aggregate.currency,
    locationCount: aggregate.locationCount,
    tenureDays: aggregate.tenureDays,
    definitionNote: CAPITAL_REVENUE_DEFINITION_NOTE,
    hasOrderData: aggregate.hasOrderData,
  };
}

export async function loadCapitalResourcesHubData(userId: string): Promise<CapitalResourcesHubData> {
  const config = loadCapitalPartnersConfig();
  const [revenueContext, recentAttestations, lenderReferrals] = await Promise.all([
    loadCapitalRevenueContext(userId),
    listRevenueAttestationsForOwner(userId),
    listCapitalLenderOffersForOwner(userId),
  ]);
  return {
    config,
    featuredPartners: listFeaturedCapitalPartners(),
    revenueContext,
    recentAttestations,
    lenderOfferPartners: listLenderOfferPartners(),
    lenderReferrals,
  };
}

export function resolveCapitalPartnerOutboundHref(slug: string): string | null {
  const partner = getCapitalPartnerBySlug(slug);
  if (!partner) return null;
  if (partner.internal) return partner.href;
  return `/api/capital/partner-outbound?slug=${encodeURIComponent(partner.slug)}`;
}
