import { MultiLocationEnterprisePanel } from "@/components/enterprise/multi-location-enterprise-panel";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { MultiLocationCustomDateForm } from "@/components/dashboard/multi-location-custom-date-form";
import { PlanGate } from "@/components/plans/plan-gate";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadEnterpriseMultiLocationDashboard } from "@/services/enterprise/multi-location-service";

export const metadata = {
  title: "Multi-location Enterprise — Dashboard",
  description: "Enterprise view of all locations with comparison and drill-down.",
};

export const dynamic = "force-dynamic";

const BASE_PATH = "/dashboard/enterprise/multi-location";

export default async function EnterpriseMultiLocationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { userId, workspaceId, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const locationId = typeof sp.locationId === "string" ? sp.locationId : undefined;

  if (!workspaceId) {
    return (
      <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">Multi-location enterprise requires a workspace</CardTitle>
          <CardDescription>Complete workspace setup to compare all locations.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const [{ brands, locations }, dashboard] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadEnterpriseMultiLocationDashboard({
      workspaceId,
      filters,
      selectedLocationId: locationId,
    }),
  ]);

  return (
    <PlanGate userId={userId} feature="multi_location" title="Multi-location enterprise">
      <div className="space-y-6">
        <AnalyticsFilterBar
          filters={filters}
          basePath={BASE_PATH}
          brands={brands}
          locations={locations}
        />
        <MultiLocationCustomDateForm filters={filters} basePath={BASE_PATH} />
        <MultiLocationEnterprisePanel dashboard={dashboard} />
      </div>
    </PlanGate>
  );
}
