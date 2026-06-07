import { DeliveryCommissionPanel } from "@/components/dashboard/analytics/delivery-commission-panel";
import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadDeliveryCommissionTracking } from "@/services/delivery/delivery-commission-tracking-service";

export default async function DeliveryCommissionsAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, snapshot] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadDeliveryCommissionTracking({ userId: dataUserId }, filters),
  ]);

  return (
    <div className="space-y-6">
      <AnalyticsFilterBar
        filters={filters}
        basePath="/dashboard/analytics/delivery-commissions"
        brands={brands}
        locations={locations}
      />
      <DeliveryCommissionPanel snapshot={snapshot} />
    </div>
  );
}
