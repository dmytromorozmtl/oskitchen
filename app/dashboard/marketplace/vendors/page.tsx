import Link from "next/link";
import { Store } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { MarketplaceVendorsListClient } from "@/components/marketplace/marketplace-vendors-list-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMyMarketplaceVendors } from "@/services/marketplace/marketplace-vendors-service";

export default async function MarketplaceVendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const query = typeof sp.q === "string" ? sp.q : Array.isArray(sp.q) ? sp.q[0] : undefined;
  const { workspaceId, dataUserId } = await getTenantActor();

  if (!workspaceId) {
    return (
      <EmptyState
        icon={Store}
        title="Workspace required"
        description="Open a workspace to manage marketplace vendors."
        primaryLabel="Marketplace"
        primaryHref="/dashboard/marketplace"
      />
    );
  }

  const model = await loadMyMarketplaceVendors({
    workspaceId,
    dataUserId,
    query,
  });

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="My Vendors"
        description="Favorite suppliers, track spend and delivery performance, upload contracts, and quick reorder."
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/marketplace/catalog">Discover vendors</Link>
          </Button>
        }
      />

      {model.vendors.length === 0 && model.favorites.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendor relationships yet"
          description="Place marketplace orders or browse the catalog to build your supplier list."
          primaryLabel="Browse catalog"
          primaryHref="/dashboard/marketplace/catalog"
          secondaryLabel="View orders"
          secondaryHref="/dashboard/marketplace/orders"
        />
      ) : (
        <MarketplaceVendorsListClient
          vendors={model.vendors}
          favorites={model.favorites}
          initialQuery={query}
        />
      )}
    </div>
  );
}
