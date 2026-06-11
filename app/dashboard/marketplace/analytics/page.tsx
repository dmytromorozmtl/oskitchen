import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { LazyMarketplaceAnalyticsClient } from "@/components/charts/lazy-chart-panels";
import { MarketplaceDataUnavailable } from "@/components/marketplace/marketplace-data-unavailable";
import { PageHeader } from "@/components/layout/page-header";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";
import { loadMarketplaceAnalytics } from "@/services/marketplace/marketplace-analytics-service";

export default async function MarketplaceAnalyticsPage() {
  const { workspaceId, dataUserId, userId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Workspace required"
        description="Open a workspace to view marketplace procurement analytics."
        primaryLabel="Marketplace"
        primaryHref="/dashboard/marketplace"
      />
    );
  }

  const access = await resolveMarketplaceHubAccess();

  let model;
  try {
    model = await loadMarketplaceAnalytics({ workspaceId, dataUserId, userId });
  } catch (error) {
    console.error("[marketplace-analytics] load failed", error);
    if (isPrismaMigrationMissingError(error)) {
      return <MarketplaceDataUnavailable />;
    }
    throw error;
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Analytics"
        description="Procurement spend, unit cost trends, budget alerts, and inventory-linked replenishment suggestions."
      />

      <LazyMarketplaceAnalyticsClient model={model} canManageBudget={access.canCreateOrders} />
    </div>
  );
}
