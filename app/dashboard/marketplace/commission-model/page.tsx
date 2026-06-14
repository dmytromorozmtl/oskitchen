import Link from "next/link";

import { MarketplaceCommissionModelPanel } from "@/components/marketplace/marketplace-commission-model-panel";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import {
  MARKETPLACE_COMMISSION_MODEL_P2_118_PLATFORM_ANALYTICS_ROUTE,
  MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID,
} from "@/lib/marketplace/marketplace-commission-model-p2-118-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMarketplaceCommissionModelSnapshot } from "@/services/marketplace/marketplace-commission-model-p2-118-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-118 — marketplace commission model hub. */
export default function MarketplaceCommissionModelPage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceCommissionModelPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceCommissionModelPageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.commission_model.read",
    route: "/dashboard/marketplace/commission-model",
  });
  if (!access.ok) return access.deny;

  const { workspaceId } = await getTenantActor();
  const snapshot = await loadMarketplaceCommissionModelSnapshot({ workspaceId });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Commission model</h1>
          <p className="text-sm text-muted-foreground">
            Commission · featured · lead fee · transaction fee — policy{" "}
            {MARKETPLACE_COMMISSION_MODEL_P2_118_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={MARKETPLACE_COMMISSION_MODEL_P2_118_PLATFORM_ANALYTICS_ROUTE}>
            Platform analytics
          </Link>
        </Button>
      </div>
      <MarketplaceCommissionModelPanel snapshot={snapshot} />
    </div>
  );
}
