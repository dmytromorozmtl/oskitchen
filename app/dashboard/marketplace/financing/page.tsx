import Link from "next/link";

import { MarketplaceFinancingPanel } from "@/components/marketplace/marketplace-financing-panel";
import { MarketplaceDataUnavailable } from "@/components/marketplace/marketplace-data-unavailable";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMarketplaceFinancingSnapshot } from "@/services/marketplace/financing";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

export const metadata = {
  title: "Marketplace Financing",
  description: "Net-30/60/90 terms, early payment discounts, and invoice factoring for HoReCa procurement.",
};

export default function MarketplaceFinancingPage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceFinancingPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceFinancingPageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.financing.read",
    route: "/dashboard/marketplace/financing",
  });
  if (!access.ok) return access.deny;

  const { workspaceId, dataUserId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Open a workspace to use marketplace financing.
      </div>
    );
  }

  let snapshot;
  try {
    snapshot = await loadMarketplaceFinancingSnapshot({
      workspaceId,
      userId: dataUserId,
    });
  } catch (error) {
    console.error("[marketplace-financing] load failed", error);
    if (isPrismaMigrationMissingError(error)) {
      return <MarketplaceDataUnavailable />;
    }
    throw error;
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Marketplace Financing"
        description="Net-30, Net-60, and Net-90 supplier terms, early payment discounts, and receivables factoring on marketplace purchase orders."
        actions={
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/analytics/capital">Capital partners</Link>
          </Button>
        }
      />
      <MarketplaceFinancingPanel
        snapshot={snapshot}
        canManage={access.canCreateOrders}
      />
    </div>
  );
}
