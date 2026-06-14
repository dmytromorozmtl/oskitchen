import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MarketplaceVendorDetailClient } from "@/components/marketplace/marketplace-vendor-detail-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions/guards";
import { resolveMarketplaceHubAccess } from "@/lib/marketplace/marketplace-page-access";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { loadMarketplaceVendorDetail } from "@/services/marketplace/marketplace-vendors-service";
import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";

type MarketplaceVendorDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function MarketplaceVendorDetailPage(props: MarketplaceVendorDetailPageProps) {
  return (
    <SuspenseWave1PageBoundary sector="marketplace">
      <MarketplaceVendorDetailPageAsync {...props} />
    </SuspenseWave1PageBoundary>
  );
}

async function MarketplaceVendorDetailPageAsync({
  params,
}: MarketplaceVendorDetailPageProps) {
  const { id } = await params;
  const { workspaceId, dataUserId } = await getTenantActor();
  if (!workspaceId) notFound();

  const [access, vendor] = await Promise.all([
    resolveMarketplaceHubAccess(),
    loadMarketplaceVendorDetail({ workspaceId, dataUserId, vendorId: id }),
  ]);

  if (!vendor) notFound();

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title={vendor.companyName}
        description={`${vendor.productCount} active SKUs · ${vendor.orderCount} orders with your kitchen`}
        actions={
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/marketplace/vendors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All vendors
            </Link>
          </Button>
        }
      />

      <MarketplaceVendorDetailClient
        vendor={vendor}
        canManageContract={access.canCreateOrders}
        canRate={hasPermission(access.actor.granted, "marketplace:reviews:write")}
        canReorder={access.canCartWrite}
      />
    </div>
  );
}
