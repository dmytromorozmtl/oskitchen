import {
  aggregateCapitalRevenueForWindow,
  CAPITAL_REVENUE_DEFINITION_NOTE,
  defaultTrailingYearWindow,
} from "@/lib/commercial/capital-revenue-aggregation";
import {
  listFeaturedCapitalPartners,
  loadCapitalPartnersConfig,
  type CapitalPartner,
} from "@/lib/commercial/capital-partners";
import { resolveCapitalPartnerOutboundHrefBySlug } from "@/lib/commercial/capital-partner-outbound";
import {
  loadCapitalMarketplaceSnapshot,
  type CapitalMarketplaceSnapshot,
} from "@/services/commercial/capital-multi-lender-service";
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
  marketplace: CapitalMarketplaceSnapshot;
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

export async function loadCapitalResourcesHubData(
  userId: string,
  region?: import("@/lib/commercial/capital-partners").CapitalRegion | null,
): Promise<CapitalResourcesHubData> {
  const config = loadCapitalPartnersConfig();
  const [revenueContext, recentAttestations, marketplace] = await Promise.all([
    loadCapitalRevenueContext(userId),
    listRevenueAttestationsForOwner(userId),
    loadCapitalMarketplaceSnapshot({ userId, region }),
  ]);
  return {
    config,
    featuredPartners: listFeaturedCapitalPartners(),
    revenueContext,
    recentAttestations,
    marketplace,
  };
}

export function resolveCapitalPartnerOutboundHref(slug: string): string | null {
  return resolveCapitalPartnerOutboundHrefBySlug(
    slug,
    loadCapitalPartnersConfig().partners,
  );
}
