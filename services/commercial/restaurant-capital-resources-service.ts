import {
  orderContributesToRevenue,
  sumRevenue,
  whereOrdersInWindowForOwner,
  type RevenueOrderRow,
} from "@/lib/analytics/revenue-metrics";
import {
  getCapitalPartnerBySlug,
  listFeaturedCapitalPartners,
  loadCapitalPartnersConfig,
  type CapitalPartner,
} from "@/lib/commercial/capital-partners";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

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
};

const REVENUE_DEFINITION_NOTE =
  "Gross order volume from KitchenOS orders in revenue-eligible statuses (pending through completed). Excludes cancelled orders. Not collected cash, not bank deposits, and not a credit score or lending decision.";

function defaultTrailingYearWindow(): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  from.setUTCHours(0, 0, 0, 0);
  return { from, to };
}

export async function loadCapitalRevenueContext(userId: string): Promise<CapitalRevenueContext> {
  const { from, to } = defaultTrailingYearWindow();
  const workspaceId = await resolveOwnerWorkspaceId(userId);

  const where = await whereOrdersInWindowForOwner({
    userId,
    from,
    to,
  });

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      brandId: true,
      locationId: true,
      fulfillmentType: true,
    },
  });

  const revenueRows: RevenueOrderRow[] = orders;
  const grossOrderRevenue = sumRevenue(revenueRows);
  const orderCount = revenueRows.filter((row) => orderContributesToRevenue(row.status)).length;
  const cancelledOrderCount = revenueRows.filter((row) => row.status === "CANCELLED").length;
  const locationIds = new Set(
    revenueRows.map((row) => row.locationId).filter((id): id is string => Boolean(id)),
  );

  let tenureDays: number | null = null;
  if (workspaceId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { createdAt: true },
    });
    if (workspace) {
      tenureDays = Math.floor((Date.now() - workspace.createdAt.getTime()) / 86_400_000);
    }
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { locale: true },
  });
  const currency = kitchen?.locale?.toLowerCase().startsWith("en-ca")
    ? "CAD"
    : kitchen?.locale?.toLowerCase().startsWith("en-gb")
      ? "GBP"
      : "USD";

  return {
    periodStart: from.toISOString().slice(0, 10),
    periodEnd: to.toISOString().slice(0, 10),
    grossOrderRevenue,
    orderCount,
    cancelledOrderCount,
    currency,
    locationCount: locationIds.size,
    tenureDays,
    definitionNote: REVENUE_DEFINITION_NOTE,
    hasOrderData: orderCount > 0,
  };
}

export async function loadCapitalResourcesHubData(userId: string): Promise<CapitalResourcesHubData> {
  const config = loadCapitalPartnersConfig();
  const revenueContext = await loadCapitalRevenueContext(userId);
  return {
    config,
    featuredPartners: listFeaturedCapitalPartners(),
    revenueContext,
  };
}

export function resolveCapitalPartnerOutboundHref(slug: string): string | null {
  const partner = getCapitalPartnerBySlug(slug);
  if (!partner) return null;
  if (partner.internal) return partner.href;
  return `/api/capital/partner-outbound?slug=${encodeURIComponent(partner.slug)}`;
}
