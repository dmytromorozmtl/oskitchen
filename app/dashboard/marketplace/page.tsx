import { Suspense } from "react";
import Link from "next/link";
import { Store } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { MarketplaceSkeleton } from "@/components/dashboard/marketplace-skeleton";
import { MarketplaceDashboardAsyncSection } from "@/components/marketplace/marketplace-dashboard-async-section";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";

export default async function MarketplaceDashboardPage() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.dashboard.read",
    route: "/dashboard/marketplace",
  });
  if (!access.ok) return access.deny;

  const { workspaceId, dataUserId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <EmptyState
        icon={Store}
        title="Workspace required"
        description="Open a workspace to browse the B2B HoReCa marketplace."
        primaryLabel="Today"
        primaryHref="/dashboard/today"
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Supplier Marketplace"
        description="Food, packaging, and equipment from verified HoReCa suppliers — one-click reorder, integrated with purchase orders and inventory."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/marketplace/financing">Financing</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/marketplace/price-intelligence">Price intelligence</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/marketplace/quality">Quality scoring</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/dashboard/marketplace/auto-vendor">Auto vendor savings</Link>
            </Button>
            {access.canCartWrite ? (
              <Button asChild className="rounded-full">
                <Link href="/dashboard/marketplace/catalog">Browse catalog</Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <Suspense fallback={<MarketplaceSkeleton />}>
        <MarketplaceDashboardAsyncSection
          workspaceId={workspaceId}
          dataUserId={dataUserId}
          access={access}
        />
      </Suspense>
    </div>
  );
}
