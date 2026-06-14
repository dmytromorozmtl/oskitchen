import Link from "next/link";

import { VendorAnalyticsPanel } from "@/components/marketplace/vendor-analytics-panel";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import {
  VENDOR_ANALYTICS_P2_119_POLICY_ID,
  VENDOR_ANALYTICS_P2_119_VENDOR_ANALYTICS_ROUTE,
} from "@/lib/marketplace/vendor-analytics-p2-119-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadVendorAnalyticsSnapshot } from "@/services/marketplace/vendor-analytics-p2-119-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-119 — vendor analytics hub. */
export default function VendorAnalyticsMarketplacePage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <VendorAnalyticsMarketplacePageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function VendorAnalyticsMarketplacePageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.vendor_analytics.read",
    route: "/dashboard/marketplace/vendor-analytics",
  });
  if (!access.ok) return access.deny;

  const { workspaceId } = await getTenantActor();
  const snapshot = await loadVendorAnalyticsSnapshot({ workspaceId });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendor analytics</h1>
          <p className="text-sm text-muted-foreground">
            Top products · repeat buyers · lost carts · price competitiveness — policy{" "}
            {VENDOR_ANALYTICS_P2_119_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={VENDOR_ANALYTICS_P2_119_VENDOR_ANALYTICS_ROUTE}>Full vendor analytics</Link>
        </Button>
      </div>
      <VendorAnalyticsPanel snapshot={snapshot} />
    </div>
  );
}
