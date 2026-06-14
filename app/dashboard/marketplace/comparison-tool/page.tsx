import Link from "next/link";

import { MarketplaceComparisonP2_124Panel } from "@/components/marketplace/marketplace-comparison-p2-124-panel";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import {
  MARKETPLACE_COMPARISON_P2_124_COMPARE_ROUTE,
  MARKETPLACE_COMPARISON_P2_124_POLICY_ID,
} from "@/lib/marketplace/marketplace-comparison-p2-124-policy";
import { loadMarketplaceComparisonP2_124Snapshot } from "@/services/marketplace/marketplace-comparison-p2-124-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-124 — marketplace comparison tool hub. */
export default function MarketplaceComparisonToolPage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceComparisonToolPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceComparisonToolPageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.comparison_tool.read",
    route: "/dashboard/marketplace/comparison-tool",
  });
  if (!access.ok) return access.deny;

  const snapshot = await loadMarketplaceComparisonP2_124Snapshot();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Comparison tool</h1>
          <p className="text-sm text-muted-foreground">
            Side-by-side supplier comparison — policy {MARKETPLACE_COMPARISON_P2_124_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={MARKETPLACE_COMPARISON_P2_124_COMPARE_ROUTE}>Compare prices</Link>
        </Button>
      </div>
      <MarketplaceComparisonP2_124Panel snapshot={snapshot} />
    </div>
  );
}
