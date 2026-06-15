import { notFound } from "next/navigation";

import { MarketplaceVendorDetailAdminClient } from "@/components/platform/marketplace-vendor-detail-admin-client";
import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { hasPlatformPermission } from "@/lib/platform/platform-permissions";
import { loadPlatformVendorDetail } from "@/services/marketplace/platform-vendor-moderation-service";

export const metadata = { title: "Marketplace vendor detail — Platform" };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformMarketplaceVendorDetailPage({ params }: PageProps) {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:organizations:read");

  const { id } = await params;
  const vendor = await loadPlatformVendorDetail(id);
  if (!vendor) notFound();

  const canModerate = hasPlatformPermission(ctx.permissions, "platform:organizations:write");

  return (
    <div className="text-zinc-200">
      <MarketplaceVendorDetailAdminClient vendor={vendor} canModerate={canModerate} />
    </div>
  );
}
