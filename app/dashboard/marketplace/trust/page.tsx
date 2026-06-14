import Link from "next/link";

import { MarketplaceTrustPanel } from "@/components/marketplace/marketplace-trust-panel";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import {
  MARKETPLACE_TRUST_P2_120_POLICY_ID,
  MARKETPLACE_TRUST_P2_120_PUBLIC_TRUST_ROUTE,
} from "@/lib/marketplace/marketplace-trust-p2-120-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMarketplaceTrustSnapshot } from "@/services/marketplace/marketplace-trust-p2-120-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-120 — marketplace trust hub. */
export default function MarketplaceTrustPage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceTrustPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceTrustPageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.trust.read",
    route: "/dashboard/marketplace/trust",
  });
  if (!access.ok) return access.deny;

  const { workspaceId } = await getTenantActor();
  const snapshot = await loadMarketplaceTrustSnapshot({ workspaceId });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Marketplace trust</h1>
          <p className="text-sm text-muted-foreground">
            Verified badge · SLA · reviews · disputes — policy {MARKETPLACE_TRUST_P2_120_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={MARKETPLACE_TRUST_P2_120_PUBLIC_TRUST_ROUTE}>Public trust page</Link>
        </Button>
      </div>
      <MarketplaceTrustPanel snapshot={snapshot} />
    </div>
  );
}
