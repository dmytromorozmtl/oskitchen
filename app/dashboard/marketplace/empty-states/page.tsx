import Link from "next/link";

import { MarketplaceEmptyStatesP2_123Panel } from "@/components/marketplace/marketplace-empty-states-p2-123-panel";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import {
  MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_ROUTE,
  MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID,
} from "@/lib/marketplace/marketplace-empty-states-p2-123-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMarketplaceEmptyStatesP2_123Snapshot } from "@/services/marketplace/marketplace-empty-states-p2-123-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-123 — marketplace empty states design hub. */
export default function MarketplaceEmptyStatesPage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceEmptyStatesPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceEmptyStatesPageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.empty_states.read",
    route: "/dashboard/marketplace/empty-states",
  });
  if (!access.ok) return access.deny;

  const { workspaceId } = await getTenantActor();
  const snapshot = await loadMarketplaceEmptyStatesP2_123Snapshot({ workspaceId });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marketplace empty states</h1>
          <p className="text-sm text-muted-foreground">
            No vendors · no orders · no products — policy {MARKETPLACE_EMPTY_STATES_P2_123_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={MARKETPLACE_EMPTY_STATES_P2_123_CATALOG_ROUTE}>Browse catalog</Link>
        </Button>
      </div>
      <MarketplaceEmptyStatesP2_123Panel snapshot={snapshot} />
    </div>
  );
}
