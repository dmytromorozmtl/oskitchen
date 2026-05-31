import { CapitalLenderMarketplacePanel } from "@/components/dashboard/analytics/capital-lender-marketplace-panel";
import { CapitalResourcesHub } from "@/components/dashboard/analytics/capital-resources-hub";
import { CapitalRevenueAttestationPanel } from "@/components/dashboard/analytics/capital-revenue-attestation-panel";
import { CAPITAL_REGIONS, type CapitalRegion } from "@/lib/commercial/capital-partners";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCapitalResourcesHubData } from "@/services/commercial/restaurant-capital-resources-service";

export default async function AnalyticsCapitalResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { dataUserId } = await getTenantActor();
  const params = await searchParams;
  const regionParam = params.region?.trim().toUpperCase() ?? null;
  const region =
    regionParam && CAPITAL_REGIONS.includes(regionParam as CapitalRegion)
      ? (regionParam as CapitalRegion)
      : null;

  const data = await loadCapitalResourcesHubData(dataUserId, region);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{data.config.hubTitle}</h1>
        <p className="text-muted-foreground">
          Third-party financing resources, signed revenue exports, multi-lender marketplace, and your
          KitchenOS revenue context — not loan approvals from OS Kitchen.
        </p>
      </div>
      <CapitalRevenueAttestationPanel
        recentAttestations={data.recentAttestations}
        hasOrderData={data.revenueContext.hasOrderData}
      />
      <CapitalLenderMarketplacePanel
        marketplace={data.marketplace}
        recentAttestations={data.recentAttestations}
        hasOrderData={data.revenueContext.hasOrderData}
      />
      <CapitalResourcesHub
        config={data.config}
        featuredPartners={data.featuredPartners}
        revenueContext={data.revenueContext}
      />
    </div>
  );
}
