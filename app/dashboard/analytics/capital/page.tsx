import { CapitalResourcesHub } from "@/components/dashboard/analytics/capital-resources-hub";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadCapitalResourcesHubData } from "@/services/commercial/restaurant-capital-resources-service";

export default async function AnalyticsCapitalResourcesPage() {
  const { dataUserId } = await getTenantActor();
  const data = await loadCapitalResourcesHubData(dataUserId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{data.config.hubTitle}</h1>
        <p className="text-muted-foreground">
          Third-party financing resources and your KitchenOS revenue context — not loan offers.
        </p>
      </div>
      <CapitalResourcesHub
        config={data.config}
        featuredPartners={data.featuredPartners}
        revenueContext={data.revenueContext}
      />
    </div>
  );
}
