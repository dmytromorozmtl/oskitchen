import Link from "next/link";

import { PriceIntelligencePanel } from "@/components/marketplace/price-intelligence-panel";
import { MarketplaceDataUnavailable } from "@/components/marketplace/marketplace-data-unavailable";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadPriceIntelligenceSnapshot } from "@/services/marketplace/price-intelligence";

export const metadata = {
  title: "Price Intelligence — Marketplace",
  description: "Cheapest supplier detection and one-click auto-switch for HoReCa procurement.",
};

export default async function PriceIntelligencePage() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.price_intelligence.read",
    route: "/dashboard/marketplace/price-intelligence",
  });
  if (!access.ok) return access.deny;

  const { workspaceId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Open a workspace to use price intelligence.
      </div>
    );
  }

  let snapshot;
  try {
    snapshot = await loadPriceIntelligenceSnapshot(workspaceId);
  } catch (error) {
    console.error("[price-intelligence] load failed", error);
    if (isPrismaMigrationMissingError(error)) {
      return <MarketplaceDataUnavailable />;
    }
    throw error;
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Price Intelligence"
        description="Find the cheapest verified supplier for your purchased SKUs and auto-switch carts when savings exceed your policy."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/marketplace/compare">Compare prices</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/marketplace/auto-vendor">Auto vendor</Link>
            </Button>
          </div>
        }
      />
      <PriceIntelligencePanel
        snapshot={snapshot}
        canAutoSwitch={access.canCartWrite}
      />
    </div>
  );
}
