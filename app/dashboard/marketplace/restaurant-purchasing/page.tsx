import Link from "next/link";

import { RestaurantPurchasingPanel } from "@/components/marketplace/restaurant-purchasing-panel";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import {
  RESTAURANT_PURCHASING_P2_117_COMPARE_ROUTE,
  RESTAURANT_PURCHASING_P2_117_POLICY_ID,
} from "@/lib/marketplace/restaurant-purchasing-p2-117-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadRestaurantPurchasingSnapshot } from "@/services/marketplace/restaurant-purchasing-p2-117-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-117 — restaurant purchasing marketplace hub. */
export default function RestaurantPurchasingPage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <RestaurantPurchasingPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function RestaurantPurchasingPageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.restaurant_purchasing.read",
    route: "/dashboard/marketplace/restaurant-purchasing",
  });
  if (!access.ok) return access.deny;

  const { workspaceId } = await getTenantActor();
  const snapshot = await loadRestaurantPurchasingSnapshot({ workspaceId });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Restaurant purchasing</h1>
          <p className="text-sm text-muted-foreground">
            Compare · recurring · substitutions · delivery · disputes — policy{" "}
            {RESTAURANT_PURCHASING_P2_117_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={RESTAURANT_PURCHASING_P2_117_COMPARE_ROUTE}>Compare suppliers</Link>
        </Button>
      </div>
      <RestaurantPurchasingPanel snapshot={snapshot} />
    </div>
  );
}
