import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AutoVendorClient } from "@/components/marketplace/auto-vendor-client";
import { MarketplaceDataUnavailable } from "@/components/marketplace/marketplace-data-unavailable";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { requireMarketplaceReadPage } from "@/lib/marketplace/marketplace-page-access";
import { isPrismaMigrationMissingError } from "@/lib/prisma-migration-missing";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadAutoVendorDashboard } from "@/services/marketplace/auto-vendor-service";

export const metadata = {
  title: "Auto Vendor — Marketplace",
  description: "Automatic best-price search across HoReCa vendors.",
};

export default async function AutoVendorMarketplacePage() {
  const access = await requireMarketplaceReadPage({
    operation: "marketplace.auto_vendor.read",
    route: "/dashboard/marketplace/auto-vendor",
  });
  if (!access.ok) return access.deny;

  const { workspaceId, dataUserId } = await getTenantActor();
  if (!workspaceId) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Open a workspace to use automated vendor search.
      </div>
    );
  }

  let dashboard;
  try {
    dashboard = await loadAutoVendorDashboard({
      workspaceId,
      userId: dataUserId,
    });
  } catch (error) {
    console.error("[auto-vendor] load failed", error);
    if (isPrismaMigrationMissingError(error)) {
      return <MarketplaceDataUnavailable />;
    }
    throw error;
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Automated vendor marketplace"
        description='OS Kitchen scans what you buy and flags better prices — e.g. "Packaging +15%, alternative saves $230/mo".'
        actions={
          <Button asChild variant="ghost" size="sm" className="rounded-full gap-1">
            <Link href="/dashboard/marketplace">
              <Sparkles className="h-3.5 w-3.5" />
              Marketplace hub
            </Link>
          </Button>
        }
      />

      <AutoVendorClient dashboard={dashboard} />
    </div>
  );
}
