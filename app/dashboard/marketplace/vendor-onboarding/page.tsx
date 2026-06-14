import Link from "next/link";

import { VendorOnboardingPortalPanel } from "@/components/marketplace/vendor-onboarding-portal-panel";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import {
  VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID,
  VENDOR_ONBOARDING_PORTAL_P2_116_VENDOR_ROUTE,
} from "@/lib/marketplace/vendor-onboarding-portal-p2-116-policy";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadVendorOnboardingPortalSnapshot } from "@/services/marketplace/vendor-onboarding-portal-p2-116-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

/** Blueprint P2-116 — vendor onboarding portal hub. */
export default function VendorOnboardingPortalPage() {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <VendorOnboardingPortalPageAsync  />
    </SuspenseWave1PageBoundary>
  );
}

async function VendorOnboardingPortalPageAsync() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.vendor_onboarding.read",
    route: "/dashboard/marketplace/vendor-onboarding",
  });
  if (!access.ok) return access.deny;

  const { workspaceId } = await getTenantActor();
  const snapshot = await loadVendorOnboardingPortalSnapshot({ workspaceId });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendor onboarding portal</h1>
          <p className="text-sm text-muted-foreground">
            Catalog · tiers · zones · cutoff · MOQ — policy {VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={VENDOR_ONBOARDING_PORTAL_P2_116_VENDOR_ROUTE}>Vendor cabinet</Link>
        </Button>
      </div>
      <VendorOnboardingPortalPanel snapshot={snapshot} />
    </div>
  );
}
